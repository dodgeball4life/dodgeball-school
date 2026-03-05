<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
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

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

$to = 'play@dodgeballschool.nl';
$subject = 'Nieuwe aanvraag — ' . ($input['organisatie'] ?? 'Onbekend');

$organisatie = htmlspecialchars($input['organisatie'] ?? '-');
$type = htmlspecialchars($input['type'] ?? '-');
$aantal = htmlspecialchars($input['aantal'] ?? '-');
$datum = htmlspecialchars($input['datum'] ?? '-');
$naam = htmlspecialchars($input['naam'] ?? '-');
$email = htmlspecialchars($input['email'] ?? '-');
$telefoon = htmlspecialchars($input['telefoon'] ?? '-');
$opmerking = htmlspecialchars($input['opmerking'] ?? '-');

$mailtoSubject = rawurlencode("Re: Aanvraag {$organisatie}");
$mailtoBody = rawurlencode("Hoi {$naam},\n\nBedankt voor je aanvraag! \n\n");
$replyLink = "mailto:{$email}?subject={$mailtoSubject}&body={$mailtoBody}";
$telLink = "tel:{$telefoon}";

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
            <span style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Type</span>
            <div style="font-size:15px;font-weight:600;color:#141414;margin-top:2px;">{$type}</div>
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
            <div style="margin-top:4px;">
              <a href="{$telLink}" style="color:#141414;text-decoration:none;font-size:14px;">{$telefoon}</a>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Opmerking -->
  <tr>
    <td style="padding:12px 32px;">
      <span style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Opmerking</span>
      <div style="font-size:14px;color:#333;margin-top:6px;line-height:1.5;">{$opmerking}</div>
    </td>
  </tr>

  <!-- CTA Buttons -->
  <tr>
    <td style="padding:20px 32px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" style="padding-right:6px;">
            <a href="{$replyLink}" style="display:block;background:#D5DF26;color:#141414;text-align:center;padding:14px 20px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;">Beantwoorden</a>
          </td>
          <td width="50%" style="padding-left:6px;">
            <a href="{$telLink}" style="display:block;background:#141414;color:#ffffff;text-align:center;padding:14px 20px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;">Bellen</a>
          </td>
        </tr>
      </table>
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
