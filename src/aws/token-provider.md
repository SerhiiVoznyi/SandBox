# Cross-Lambda Access Management

Multiple AWS Lambda functions share a common set of access credentials for the same external data provider.

Any Lambda function may retrieve and refresh the access token on demand. All other Lambda functions reuse this shared token and automatically rely on the refreshed version once the token expires.

The solution ensures safe concurrent access, minimizes unnecessary token refreshes, and avoids credential duplication across Lambdas.

## Proposed Solution

### Access Token Storage (DynamoDB)

A new DynamoDB table,
`{prefix}-${env}-access-tokens`,
will be created to store access tokens shared across Lambda functions.

```ts
export interface TokenItem {
  tokenType: string // Partition Key (e.g. "salesforce")
  accessToken: string // Encrypted, Base64-encoded
  expiresAt: number // Epoch seconds (TTL)
  updatedAt: number // Last update timestamp (epoch seconds)
  updating: boolean // Distributed lock flag
}
```

The table enables O(1) access by token type and supports safe concurrent updates using conditional writes.

### Encryption Strategy

To keep the solution simple and avoid KMS dependency, application-level encryption is used.

A `salt` value is stored in AWS Secrets Manager alongside the provider credentials. This salt is used to encrypt and decrypt the access token before persisting it to DynamoDB.

> Example: Salesforce credentials secret includes an additional property `"salt": "BUC-4bb3wvb3-c24789c"`

The encrypted token is stored as a Base64-encoded string in DynamoDB.

### Usage Flow

The Salesforce service composes the following components:

- AccessTokenService (DynamoDB repository)

- CryptoService (salt-based encryption/decryption)

Flow:

1. Before making an external API call, the service validates the cached access token.

2. The token is retrieved from DynamoDB and decrypted.

3. If the token is expired or the external request returns 403, the service:

- Acquires a distributed lock

- Refreshes the token

- Encrypts and stores the new token in DynamoDB

- Releases the lock

4. Other Lambda functions reuse the refreshed token automatically.

### Feature Development

#### Feature: Cross-Lambda Access Management

Stories:

- [DevOps] Terraform new dynamedb table `{prefix}-${env}-access-tokens`
- [DevOps] Update terraform to give access to dependent lambdas (list will be provided)
  - [SubTask] Added env `DYNAMODB_TABLE_ACCESS_TOKENS`:`{prefix}-${env}-access-tokens`
- [BE] Extend `npm-lambda-tools` library to contain KMSService, AccessTokenService
- [BE] ...
- [BE] Update "XYZ' lambda to access Salesforce using KMSService & AccessTokenService
