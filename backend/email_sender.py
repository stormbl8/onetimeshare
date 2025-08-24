import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_burn_confirmation_email(recipient_email: str, token: str):
    sender_email = os.getenv("SMTP_USERNAME")
    sender_password = os.getenv("SMTP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", 587))

    if not all([sender_email, sender_password, smtp_server]):
        print("SMTP environment variables not fully configured. Skipping email.")
        return

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = "OneTimeShare Message Burned Confirmation"

    body = f"Your OneTimeShare message with token {token} has been read and destroyed."
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        print(f"Confirmation email sent to {recipient_email} for token {token}")
    except Exception as e:
        print(f"Failed to send email to {recipient_email} for token {token}: {e}")
