<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dodgeballschool.nl');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
if (strlen($rawInput) > 20000) {
    http_response_code(400);
    echo json_encode(['error' => 'Request too large']);
    exit;
}

$input = json_decode($rawInput, true);

if (!$input || !is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

// Validate required fields
$emailRaw = trim($input['email'] ?? '');
if (empty($input['naam']) || empty($emailRaw)) {
    http_response_code(400);
    echo json_encode(['error' => 'Naam en e-mail zijn verplicht']);
    exit;
}

if (!filter_var($emailRaw, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Ongeldig e-mailadres']);
    exit;
}

$to = 'play@dodgeballschool.nl';
$subject = 'Nieuwe aanvraag — ' . mb_substr($input['organisatie'] ?? 'Onbekend', 0, 100);

$organisatie = htmlspecialchars(mb_substr($input['organisatie'] ?? '-', 0, 200));
$leeftijd    = htmlspecialchars(mb_substr($input['leeftijd']    ?? '-', 0, 100));
$aantal      = htmlspecialchars(mb_substr($input['aantal']      ?? '-', 0, 50));
$datum       = htmlspecialchars(mb_substr($input['datum']       ?? '-', 0, 100));
$naam        = htmlspecialchars(mb_substr($input['naam']        ?? '-', 0, 200));
$email       = htmlspecialchars($emailRaw);
$telefoon    = htmlspecialchars(mb_substr($input['telefoon']    ?? '', 0, 50));
$bericht     = htmlspecialchars(mb_substr($input['bericht']     ?? '-', 0, 2000));

$mailtoSubject = rawurlencode("Re: Aanvraag {$organisatie}");
$mailtoBody = rawurlencode("Hoi {$naam},\n\nBedankt voor je aanvraag!\n\n");
$replyLink = "mailto:{$email}?subject={$mailtoSubject}&body={$mailtoBody}";

$body = <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F0EEE7;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EEE7;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">

  <!-- Header -->
  <tr>
    <td style="background:#141414;padding:28px 32px;">
      <span style="color:#D5DF26;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Dodgeball School</span>
      <span style="color:#888;font-size:14px;float:right;line-height:28px;">Nieuwe aanvraag</span>
    </td>
  </tr>

  <!-- Organisatie highlight -->
  <tr>
    <td style="padding:28px 32px 12px;">
      <span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Organisatie</span>
      <div style="font-size:24px;font-weight:700;color:#141414;margin-top:4px;">{$organisatie}</div>
    </td>
  </tr>

  <!-- Details grid -->
  <tr>
    <td style="padding:12px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="33%" style="padding:12px 0;border-top:1px solid #eee;">
            <span style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Leeftijd</span>
            <div style="font-size:15px;font-weight:600;color:#141414;margin-top:2px;">{$leeftijd}</div>
          </td>
          <td width="33%" style="padding:12px 0;border-top:1px solid #eee;">
            <span style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Aantal</span>
            <div style="font-size:15px;font-weight:600;color:#141414;margin-top:2px;">{$aantal}</div>
          </td>
          <td width="33%" style="padding:12px 0;border-top:1px solid #eee;">
            <span style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Datum</span>
            <div style="font-size:15px;font-weight:600;color:#141414;margin-top:2px;">{$datum}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Contact info -->
  <tr>
    <td style="padding:12px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F3;border-radius:8px;">
        <tr>
          <td style="padding:16px 20px;">
            <span style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Contactpersoon</span>
            <div style="font-size:16px;font-weight:700;color:#141414;margin-top:4px;">{$naam}</div>
            <div style="margin-top:8px;">
              <a href="mailto:{$email}" style="color:#141414;text-decoration:none;font-size:14px;">{$email}</a>
            </div>
HTML;
if ($telefoon !== '') {
    $telLink = 'tel:' . preg_replace('/[^0-9+]/', '', $telefoon);
    $body .= <<<HTML
            <div style="margin-top:4px;">
              <a href="{$telLink}" style="color:#141414;text-decoration:none;font-size:14px;">{$telefoon}</a>
            </div>
HTML;
}
$body .= <<<HTML
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Bericht -->
  <tr>
    <td style="padding:12px 32px;">
      <span style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Bericht</span>
      <div style="font-size:14px;color:#333;margin-top:6px;line-height:1.5;">{$bericht}</div>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="padding:20px 32px 28px;">
      <a href="{$replyLink}" style="display:block;background:#D5DF26;color:#141414;text-align:center;padding:14px 20px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;">Beantwoorden</a>
    </td>
  </tr>

</table>
</td></tr></table>
</body>
</html>
HTML;

$headers = "From: noreply@dodgeballschool.nl\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Mail kon niet worden verzonden']);
}
