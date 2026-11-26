# G1-AUDIT v1.0.0

Passive Google One diagnostics for Shadowrocket. Observes product identifiers and explicit country/currency fields in responses; does not alter purchases or establish offer eligibility. No raw bodies, headers, credentials or URLs are deliberately persisted. Do not publish diagnostic exports.

## Installation

Import the [pinned module](https://raw.githubusercontent.com/sl1mus/g1-audit/33cfc631b8d2fc6ef65d0eb438faaac378f99186/modules/G1-AUDIT.sgmodule) into a separate test configuration. Disable competing modules. Limit HTTPS decryption to one.google.com and use only a locally generated certificate. Open https://one.google.com/g1-audit-local-v1 for the local report. Disable HTTPS decryption and remove the temporary CA profile after testing. Never enter payment data while testing.

## Verification

Script commit: `2c04774cb991fb0615f2e3e74b38c9930d6aba95`. Local Node.js mock tests: 9/9 passed. Actual Shadowrocket execution remains to be verified. The Git blob matches the local source. No global QUIC block is included; some responses may not be captured.

SHA-256 of the JavaScript: `a4a0979234dc67ba5b17f70db73726f8ce60bef8caeafb6429d3585dad3590cc`.
