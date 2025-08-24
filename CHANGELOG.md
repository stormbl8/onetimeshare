## [v1.1.1] - 2025-08-24

### Added or Changed
- **Configurable max views:** Set a limit on how many times a link can be viewed before it's destroyed.
- **Email confirmation for burn-on-read:** Optionally send an email to the sender when a message is viewed and destroyed.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.html).

## [v1.1.0] - 2025-08-24

### Added
- **One-time message sharing:** Messages self-destruct after a single view.
- **Optional password protection:** Add a password for extra security.
- **Expiration time:** Set how long the link remains valid.
- **Multi-language support:** English, Turkish, and German.
- **Dark/light theme toggle.**
- **QR code generation for easy sharing.**
- **Toaster Notification** 
- **Redis** it's incredibly fast and has built-in support for expiring keys, which simplifies message expiration logic significantly.
- **End-to-end encryption:** Messages are encrypted in the browser and can only be decrypted by the recipient with the link. The server never sees the plaintext message.
