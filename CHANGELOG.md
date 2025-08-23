# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.html).

## [v1.0.0] - 2024-05-15

### Added
- **Initial Commit**
- **One-time message sharing:** Messages self-destruct after a single view.
- **Optional password protection:** Add a password for extra security.
- **Expiration time:** Set how long the link remains valid.

## [v1.0.2] - 2024-05-22

### Added
- **Multi-language support:** English, Turkish, and German.
- **Dark/light theme toggle.**
- **QR code generation for easy sharing.**
- **Toaster Notification** 

## [v1.0.3] - 2024-05-22

### Added
- **Redis** it's incredibly fast and has built-in support for expiring keys, which simplifies message expiration logic significantly.
- **Optional password protection removed**
- **End-to-end encryption:** Messages are encrypted in the browser and can only be decrypted by the recipient with the link. The server never sees the plaintext message.
