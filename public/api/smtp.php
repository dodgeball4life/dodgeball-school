<?php
/**
 * Minimal SMTP mailer — no external dependencies.
 * Requires PHP openssl + sockets extensions.
 */
function smtp_send($config, $to, $subject, $htmlBody, $headers = []) {
    $host = $config['host'];
    $port = (int)($config['port'] ?? 587);
    $user = $config['user'];
    $pass = $config['pass'];
    $from = $config['from'] ?? $user;

    $prefix = ($port === 465) ? 'ssl://' : 'tcp://';
    $conn = @fsockopen($prefix . $host, $port, $errno, $errstr, 10);
    if (!$conn) {
        return "Connection failed: {$errstr} ({$errno})";
    }
    stream_set_timeout($conn, 10);

    $resp = fgets($conn, 512);
    if (substr($resp, 0, 3) !== '220') {
        fclose($conn);
        return "Unexpected greeting: {$resp}";
    }

    // EHLO
    $err = smtp_command($conn, "EHLO dodgeballschool.nl", 250);
    if ($err) return $err;

    // STARTTLS for port 587
    if ($port === 587) {
        $err = smtp_command($conn, "STARTTLS", 220);
        if ($err) return $err;
        if (!stream_socket_enable_crypto($conn, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) {
            fclose($conn);
            return "TLS handshake failed";
        }
        $err = smtp_command($conn, "EHLO dodgeballschool.nl", 250);
        if ($err) return $err;
    }

    // AUTH LOGIN
    $err = smtp_command($conn, "AUTH LOGIN", 334);
    if ($err) return $err;
    $err = smtp_command($conn, base64_encode($user), 334);
    if ($err) return $err;
    $err = smtp_command($conn, base64_encode($pass), 235);
    if ($err) return "Auth failed (check SMTP credentials)";

    // MAIL FROM
    $err = smtp_command($conn, "MAIL FROM:<{$from}>", 250);
    if ($err) return $err;

    // RCPT TO
    $err = smtp_command($conn, "RCPT TO:<{$to}>", 250);
    if ($err) return $err;

    // DATA
    $err = smtp_command($conn, "DATA", 354);
    if ($err) return $err;

    // Build message
    $boundary = md5(uniqid(time()));
    $msg = "From: {$from}\r\n";
    $msg .= "To: {$to}\r\n";
    $msg .= "Subject: {$subject}\r\n";
    foreach ($headers as $k => $v) {
        $msg .= "{$k}: {$v}\r\n";
    }
    $msg .= "MIME-Version: 1.0\r\n";
    $msg .= "Content-Type: text/html; charset=UTF-8\r\n";
    $msg .= "Content-Transfer-Encoding: base64\r\n";
    $msg .= "\r\n";
    $msg .= chunk_split(base64_encode($htmlBody));
    $msg .= "\r\n.\r\n";

    fwrite($conn, $msg);
    $resp = fgets($conn, 512);
    if (substr($resp, 0, 3) !== '250') {
        fclose($conn);
        return "DATA rejected: {$resp}";
    }

    smtp_command($conn, "QUIT", 221);
    fclose($conn);

    return true;
}

function smtp_command($conn, $cmd, $expectCode) {
    fwrite($conn, $cmd . "\r\n");
    $resp = '';
    while ($line = fgets($conn, 512)) {
        $resp .= $line;
        // Multi-line responses have a dash after the code; last line has a space
        if (isset($line[3]) && $line[3] !== '-') break;
    }
    if ((int)substr($resp, 0, 3) !== $expectCode) {
        fclose($conn);
        return "SMTP error (expected {$expectCode}): {$resp}";
    }
    return null;
}
