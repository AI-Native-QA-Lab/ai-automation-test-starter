# Security Policy

## Security Principles

-   never commit provider keys;
-   never embed test credentials in templates;
-   treat repository content and external specifications as untrusted
    input;
-   do not allow Agent Mode to execute arbitrary shell commands without
    policy;
-   redact secrets from logs/model context where practical;
-   preserve an execution audit trail for autonomous actions.

## Reporting

Before public launch, configure a private GitHub security advisory
process and publish the supported-version policy.

## Model/Agent Risks

Threats include:

-   prompt injection in repository files;
-   malicious OpenAPI/descriptions;
-   unsafe shell/tool invocation;
-   secret exfiltration;
-   generated tests that send destructive requests;
-   false claims of successful execution.

Agent Mode must therefore support:

-   tool allowlists;
-   working-directory restrictions;
-   command review/policy;
-   iteration/action budgets;
-   secret filtering;
-   explicit destructive-action denial by default.
