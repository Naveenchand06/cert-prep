// AWS Solutions Architect Associate (SAA-C03) practice question bank.
//
// Each question:
//   topic    - study topic, used for the topic filter on the start screen (see TOPICS)
//   domain   - one of the four SAA-C03 exam domains (used for the results breakdown)
//   pick     - how many options must be selected (1 = radio, 2+ = checkboxes)
//   options  - each option has `text`, `correct`, and a one-liner `why`
//
// Questions are identified internally by a hash of their text, so the app can
// track which ones you have already seen. Editing a question's text makes the
// app treat it as new — that is fine and intentional.

const TOPICS = [
  "IAM & Identity",
  "Data Protection & Encryption",
  "Network & Edge Security",
  "VPC & Hybrid Connectivity",
  "DNS, CDN & Global Traffic",
  "Compute, Containers & Scaling",
  "Storage",
  "Databases",
  "Decoupling & Integration",
  "Analytics & Data Pipelines",
  "Migration & Transfer",
  "Cost Management & Governance",
];

const QUESTION_BANK = [
  // ============================================================
  // IAM & Identity
  // ============================================================
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "An application running on EC2 instances needs to read objects from an S3 bucket. What is the MOST secure way to grant this access?",
    options: [
      { text: "Create an IAM user, generate access keys, and store them in a config file on the instance.", correct: false, why: "Long-lived access keys on an instance can leak and must be rotated manually." },
      { text: "Attach an IAM role with an S3 read policy to the EC2 instances via an instance profile.", correct: true, why: "Roles deliver temporary, auto-rotated credentials through the instance metadata service — no stored secrets." },
      { text: "Make the S3 bucket public but restrict access with a firewall on the instances.", correct: false, why: "A public bucket exposes data to the entire internet; an instance firewall does nothing to protect it." },
      { text: "Embed the root account access keys in the application code.", correct: false, why: "Root credentials should never be used programmatically, let alone hardcoded." },
    ],
  },
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "Developers in Account A need temporary access to resources in Account B. What is the recommended approach?",
    options: [
      { text: "Create IAM users in Account B and share the passwords.", correct: false, why: "Duplicated users and shared passwords are hard to audit and violate least privilege." },
      { text: "Create a cross-account IAM role in Account B and let Account A users assume it via STS.", correct: true, why: "AssumeRole issues short-lived credentials and keeps a clean, auditable trust boundary between accounts." },
      { text: "Copy Account B's root access keys to Account A.", correct: false, why: "Sharing root credentials is the single worst practice in AWS security." },
      { text: "Open all security groups in Account B to Account A's IP range.", correct: false, why: "Security groups control network traffic, not IAM authorization to AWS resources." },
    ],
  },
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 2,
    question:
      "A company wants to enforce MFA and centrally manage access across many AWS accounts in an organization. Which TWO services best support this?",
    options: [
      { text: "AWS IAM Identity Center (successor to AWS SSO)", correct: true, why: "Identity Center gives centralized, MFA-enforced workforce access across all organization accounts." },
      { text: "AWS Organizations with Service Control Policies", correct: true, why: "SCPs set organization-wide permission guardrails (e.g., deny actions without MFA)." },
      { text: "Amazon Cognito user pools", correct: false, why: "Cognito handles customer-facing application sign-in, not workforce access to AWS accounts." },
      { text: "AWS Config", correct: false, why: "Config records resource compliance; it does not manage access." },
    ],
  },
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A mobile app needs to let users sign up, sign in (including via Google/Facebook), and then access AWS resources with temporary credentials. Which service combination fits?",
    options: [
      { text: "Amazon Cognito user pools for auth and identity pools for temporary AWS credentials.", correct: true, why: "User pools handle sign-up/sign-in with social federation; identity pools exchange tokens for scoped temporary AWS credentials." },
      { text: "IAM users created per app user.", correct: false, why: "Creating an IAM user per end customer does not scale and IAM has a 5,000-user quota." },
      { text: "AWS Directory Service.", correct: false, why: "Directory Service is for Active Directory workloads, not consumer mobile sign-in." },
      { text: "Amazon Inspector.", correct: false, why: "Inspector is a vulnerability scanner and has nothing to do with authentication." },
    ],
  },
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A platform team lets developers create their own IAM roles for applications, but must ensure no developer-created role can ever exceed a defined set of maximum permissions. What should the team use?",
    options: [
      { text: "Permissions boundaries attached to the developer-created roles.", correct: true, why: "A permissions boundary caps the maximum permissions a role can have, regardless of its attached policies." },
      { text: "AWS Config rules to detect over-privileged roles.", correct: false, why: "Config detects violations after the fact; it does not prevent the role from being over-privileged." },
      { text: "An SCP that denies iam:CreateRole.", correct: false, why: "Blocking role creation entirely breaks the self-service model instead of bounding it." },
      { text: "Inline policies instead of managed policies.", correct: false, why: "Inline vs managed is a packaging choice; it imposes no permission ceiling." },
    ],
  },
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "An organization must guarantee that no account in its 'Sandbox' OU can ever launch resources outside eu-west-1, even by an account administrator. What should be applied?",
    options: [
      { text: "A Service Control Policy on the Sandbox OU denying all actions outside eu-west-1.", correct: true, why: "SCPs are organization guardrails that even account administrators and root cannot override." },
      { text: "An IAM policy attached to every user in those accounts.", correct: false, why: "An account admin can simply detach or edit an IAM policy in their own account." },
      { text: "AWS Config rules flagging out-of-Region resources.", correct: false, why: "Config reports violations after resources exist rather than preventing them." },
      { text: "A permissions boundary on the account root user.", correct: false, why: "Permissions boundaries cannot be applied to the root user." },
    ],
  },
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "An on-premises Active Directory is the company's source of truth for employee identity. Employees need single sign-on to the AWS Management Console without new credentials. What should be configured?",
    options: [
      { text: "Federation — connect AD to IAM Identity Center (or a SAML 2.0 identity provider in IAM).", correct: true, why: "SAML federation lets employees sign in with existing corporate credentials and assume roles in AWS." },
      { text: "Create matching IAM users and sync passwords nightly.", correct: false, why: "Duplicating identities and syncing passwords is insecure and an operational nightmare." },
      { text: "Share a single IAM user among all employees.", correct: false, why: "Shared credentials destroy accountability and auditability." },
      { text: "Use Amazon Cognito user pools for employee console access.", correct: false, why: "Cognito targets application end users, not workforce console SSO." },
    ],
  },
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A Lambda function must read from a DynamoDB table and publish to an SNS topic. How should permissions be granted following best practice?",
    options: [
      { text: "An execution role with a policy granting only dynamodb:GetItem on that table and sns:Publish on that topic.", correct: true, why: "A scoped execution role is least privilege — specific actions on specific resource ARNs." },
      { text: "An execution role with the AdministratorAccess managed policy.", correct: false, why: "Full admin rights on a function that needs two actions is a textbook least-privilege violation." },
      { text: "Access keys stored in Lambda environment variables.", correct: false, why: "Lambda has native role support; storing keys adds risk with no benefit." },
      { text: "A resource policy on the Lambda function.", correct: false, why: "A Lambda resource policy controls who can invoke the function, not what the function can access." },
    ],
  },
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A security review finds an IAM role with broad permissions. The team needs to know which permissions the role has actually used in the last 90 days so unused ones can be removed. Which tool provides this?",
    options: [
      { text: "IAM Access Advisor (service last accessed data).", correct: true, why: "Access Advisor shows which services a principal actually used and when, guiding permission trimming." },
      { text: "Amazon Inspector.", correct: false, why: "Inspector scans workloads for software vulnerabilities, not IAM permission usage." },
      { text: "AWS Trusted Advisor.", correct: false, why: "Trusted Advisor gives broad best-practice checks, not per-role permission usage history." },
      { text: "Amazon Macie.", correct: false, why: "Macie classifies sensitive data in S3; it has no view of IAM usage." },
    ],
  },

  // ============================================================
  // Data Protection & Encryption
  // ============================================================
  {
    topic: "Data Protection & Encryption",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A company must encrypt data at rest in S3 and needs an audit trail of every time the encryption key is used. Which solution meets this requirement?",
    options: [
      { text: "SSE-S3 (Amazon S3 managed keys)", correct: false, why: "SSE-S3 keys are fully managed by S3 and key usage is not individually auditable in CloudTrail." },
      { text: "SSE-KMS with a customer managed key", correct: true, why: "Every use of a KMS customer managed key is logged in CloudTrail, giving a full audit trail." },
      { text: "Client-side encryption with keys in a text file", correct: false, why: "Keys in a file provide no managed audit trail and are easy to mishandle." },
      { text: "SSE-C (customer-provided keys)", correct: false, why: "With SSE-C you must supply and track the key on every request yourself — AWS keeps no key-usage audit log." },
    ],
  },
  {
    topic: "Data Protection & Encryption",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "An application uses a database password that must be rotated automatically every 30 days. Which service should be used?",
    options: [
      { text: "AWS Secrets Manager", correct: true, why: "Secrets Manager natively supports scheduled automatic rotation, including built-in Lambda rotation for RDS." },
      { text: "SSM Parameter Store (Standard tier)", correct: false, why: "Parameter Store stores secrets but has no built-in automatic rotation." },
      { text: "S3 bucket with SSE-KMS", correct: false, why: "S3 is object storage, not a secrets lifecycle manager." },
      { text: "IAM policy variables", correct: false, why: "IAM policy variables are for policy conditions, not storing or rotating credentials." },
    ],
  },
  {
    topic: "Data Protection & Encryption",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "Financial records written to S3 must be impossible to delete or overwrite by ANY user — including the root user — for a 7-year regulatory retention period. What should the architect configure?",
    options: [
      { text: "S3 Object Lock in compliance mode with a 7-year retention period.", correct: true, why: "Compliance mode enforces WORM protection that no identity, including root, can shorten or remove." },
      { text: "S3 Object Lock in governance mode.", correct: false, why: "Governance mode can be bypassed by users with s3:BypassGovernanceRetention — not strict enough for this rule." },
      { text: "A bucket policy denying s3:DeleteObject.", correct: false, why: "Bucket policies can be edited or deleted by an administrator at any time." },
      { text: "S3 Versioning with MFA Delete.", correct: false, why: "MFA Delete raises the bar but authorized users can still permanently delete versions." },
    ],
  },
  {
    topic: "Data Protection & Encryption",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A web application behind an ALB must serve HTTPS with a certificate that renews automatically and costs nothing to issue. What is the recommended approach?",
    options: [
      { text: "Request a public certificate from AWS Certificate Manager (ACM) and attach it to the ALB listener.", correct: true, why: "ACM public certificates are free, integrate natively with ALB/CloudFront, and renew automatically." },
      { text: "Buy a certificate from a third-party CA and import it into ACM.", correct: false, why: "Imported certificates cost money and ACM cannot auto-renew them." },
      { text: "Generate a self-signed certificate on the ALB.", correct: false, why: "Browsers reject self-signed certificates, and ALBs don't generate certificates anyway." },
      { text: "Install certbot on every EC2 instance behind the ALB.", correct: false, why: "TLS should terminate at the ALB; per-instance certbot adds fragile operational overhead." },
    ],
  },
  {
    topic: "Data Protection & Encryption",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "Regulations require that the company generate and hold its own key material, and that the key never exists in plaintext outside a validated hardware security module it controls. Which service meets this?",
    options: [
      { text: "AWS CloudHSM", correct: true, why: "CloudHSM gives single-tenant, FIPS-validated Level 3 HSMs where the customer alone controls and holds the keys." },
      { text: "AWS KMS with an AWS managed key", correct: false, why: "AWS managed keys are created and controlled by AWS — the opposite of the requirement." },
      { text: "Secrets Manager with automatic rotation", correct: false, why: "Secrets Manager stores application secrets; it is not an HSM for customer-held key material." },
      { text: "SSE-S3 encryption", correct: false, why: "SSE-S3 keys are entirely AWS managed with no customer key custody." },
    ],
  },
  {
    topic: "Data Protection & Encryption",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "An unencrypted production RDS MySQL instance must be encrypted at rest with minimal data loss. What is the correct procedure?",
    options: [
      { text: "Take a snapshot, copy the snapshot with encryption enabled, and restore a new instance from the encrypted copy.", correct: true, why: "You cannot encrypt an existing RDS instance in place — encrypting the snapshot copy on restore is the supported path." },
      { text: "Enable encryption on the running instance from the console.", correct: false, why: "RDS does not allow toggling encryption on an existing instance." },
      { text: "Attach an encrypted EBS volume to the RDS instance.", correct: false, why: "RDS storage is managed — you cannot attach your own EBS volumes." },
      { text: "Enable SSL/TLS for client connections.", correct: false, why: "TLS encrypts data in transit, not data at rest." },
    ],
  },
  {
    topic: "Data Protection & Encryption",
    domain: "Design Secure Architectures",
    pick: 2,
    question:
      "A compliance team requires that S3 objects be encrypted in transit and that any unencrypted upload be rejected. Which TWO measures accomplish this?",
    options: [
      { text: "A bucket policy denying requests where aws:SecureTransport is false.", correct: true, why: "This condition rejects any plain HTTP request, forcing TLS for all access." },
      { text: "A bucket policy denying s3:PutObject when the encryption header is absent.", correct: true, why: "A condition on s3:x-amz-server-side-encryption rejects uploads that don't request encryption." },
      { text: "Enabling S3 Versioning.", correct: false, why: "Versioning preserves object history; it has no bearing on encryption." },
      { text: "Enabling S3 Transfer Acceleration.", correct: false, why: "Transfer Acceleration is a performance feature, unrelated to encryption enforcement." },
    ],
  },
  {
    topic: "Data Protection & Encryption",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A team needs to share an encrypted EBS snapshot with another AWS account. What must be true?",
    options: [
      { text: "The snapshot must be encrypted with a customer managed KMS key, and that key must be shared with the target account.", correct: true, why: "Snapshots encrypted with the default AWS managed key cannot be shared — a customer managed key with a cross-account grant is required." },
      { text: "Encrypted snapshots can be shared publicly like unencrypted ones.", correct: false, why: "AWS never allows encrypted snapshots to be made public." },
      { text: "The snapshot must first be decrypted by removing the KMS key.", correct: false, why: "You cannot strip encryption from a snapshot; you would have to copy to an unencrypted volume, defeating the purpose." },
      { text: "Both accounts must be in the same VPC.", correct: false, why: "Snapshot sharing is an account/KMS permission matter, not a network one." },
    ],
  },
  {
    topic: "Data Protection & Encryption",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "An application stores configuration values, some of which are sensitive (API tokens), and the team wants a free option with hierarchical organization and KMS encryption. Which service is the best fit?",
    options: [
      { text: "AWS Systems Manager Parameter Store with SecureString parameters.", correct: true, why: "Parameter Store's standard tier is free, supports hierarchical paths, and encrypts SecureString values with KMS." },
      { text: "AWS Secrets Manager.", correct: false, why: "It works but charges per secret per month — unnecessary when automatic rotation isn't required." },
      { text: "Environment variables in plaintext.", correct: false, why: "Plaintext tokens in environment variables are exposed to anyone who can describe the resource." },
      { text: "A DynamoDB table with a custom encryption layer.", correct: false, why: "Building your own secret store duplicates a managed service badly." },
    ],
  },

  // ============================================================
  // Network & Edge Security
  // ============================================================
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question: "Which statement about security groups and network ACLs is correct?",
    options: [
      { text: "Security groups are stateful; network ACLs are stateless.", correct: true, why: "Return traffic is automatically allowed by security groups, while NACLs require explicit inbound and outbound rules." },
      { text: "Security groups are stateless; network ACLs are stateful.", correct: false, why: "It is the reverse — security groups track connection state, NACLs do not." },
      { text: "Both are stateful.", correct: false, why: "NACLs are stateless; return traffic must be explicitly allowed." },
      { text: "Security groups support explicit deny rules.", correct: false, why: "Security groups only have allow rules; explicit deny is a NACL feature." },
    ],
  },
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A static website in S3 is served through CloudFront. How do you ensure users can ONLY access content via CloudFront, not directly from S3?",
    options: [
      { text: "Use Origin Access Control (OAC) and a bucket policy that only allows the CloudFront distribution.", correct: true, why: "OAC lets CloudFront sign origin requests so the bucket policy can reject any direct S3 access." },
      { text: "Enable S3 Transfer Acceleration.", correct: false, why: "Transfer Acceleration speeds up uploads over long distances; it has nothing to do with access control." },
      { text: "Make the bucket public and rely on CloudFront caching.", correct: false, why: "A public bucket remains directly reachable regardless of CloudFront." },
      { text: "Attach a security group to the S3 bucket.", correct: false, why: "S3 is not in a VPC — you cannot attach security groups to buckets." },
    ],
  },
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A web application behind an Application Load Balancer is being hit with SQL-injection attempts. Which service blocks these at the edge with the LEAST application change?",
    options: [
      { text: "AWS WAF with managed SQL-injection rules attached to the ALB.", correct: true, why: "WAF inspects HTTP requests and its managed rule groups block SQLi patterns with zero code changes." },
      { text: "AWS Shield Standard.", correct: false, why: "Shield protects against DDoS attacks, not application-layer injection attacks." },
      { text: "Amazon GuardDuty.", correct: false, why: "GuardDuty detects threats from logs; it does not block requests inline." },
      { text: "Rewrite the application input validation.", correct: false, why: "Effective, but it is the opposite of 'least application change'." },
    ],
  },
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A company must discover and report any personally identifiable information (PII) stored across hundreds of S3 buckets, with ongoing automated monitoring. Which service should be used?",
    options: [
      { text: "Amazon Macie", correct: true, why: "Macie uses machine learning and pattern matching to continuously discover and classify sensitive data such as PII in S3." },
      { text: "Amazon GuardDuty", correct: false, why: "GuardDuty detects threats and anomalous activity, not sensitive-data classification." },
      { text: "Amazon Inspector", correct: false, why: "Inspector scans EC2, ECR, and Lambda for software vulnerabilities, not data content." },
      { text: "AWS Shield Advanced", correct: false, why: "Shield is DDoS protection and has nothing to do with data discovery." },
    ],
  },
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A security team wants continuous, automated detection of compromised EC2 instances, crypto-mining activity, and anomalous IAM API calls using existing log sources. Which service should be enabled?",
    options: [
      { text: "Amazon GuardDuty", correct: true, why: "GuardDuty continuously analyzes CloudTrail, VPC Flow Logs, and DNS logs with threat intelligence to flag exactly these behaviors." },
      { text: "AWS Config", correct: false, why: "Config tracks resource configuration compliance, not active threats." },
      { text: "AWS CloudTrail alone", correct: false, why: "CloudTrail records the API calls but performs no threat detection or analysis on them." },
      { text: "Amazon Inspector", correct: false, why: "Inspector finds software vulnerabilities and unintended exposure, not live attacker behavior." },
    ],
  },
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A high-profile application requires DDoS protection with 24/7 access to the AWS DDoS Response Team and cost protection against scaling charges during an attack. What is required?",
    options: [
      { text: "AWS Shield Advanced", correct: true, why: "Shield Advanced adds DRT support, advanced attack mitigation, and billing protection over the free Shield Standard." },
      { text: "AWS Shield Standard", correct: false, why: "Standard is automatic and free but includes no DRT access or cost protection." },
      { text: "AWS WAF alone", correct: false, why: "WAF filters application-layer requests but provides no DRT support or DDoS cost protection." },
      { text: "Amazon GuardDuty", correct: false, why: "GuardDuty is a detection service, not DDoS mitigation." },
    ],
  },
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "An architect must record all network traffic metadata entering and leaving EC2 network interfaces to investigate a suspected data exfiltration. What should be enabled?",
    options: [
      { text: "VPC Flow Logs sent to CloudWatch Logs or S3.", correct: true, why: "Flow Logs capture accepted and rejected IP traffic metadata per ENI, subnet, or VPC." },
      { text: "AWS CloudTrail data events.", correct: false, why: "CloudTrail records AWS API calls, not network packet flows between hosts." },
      { text: "CloudWatch detailed monitoring.", correct: false, why: "Detailed monitoring increases metric frequency; it captures no traffic information." },
      { text: "AWS Config recorder.", correct: false, why: "Config tracks configuration changes, not traffic." },
    ],
  },
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "Only requests from a corporate VPN's fixed public IP range should reach an internet-facing ALB. What is the simplest way to enforce this?",
    options: [
      { text: "Restrict the ALB's security group inbound rules to the corporate CIDR range.", correct: true, why: "A security group on the ALB is the most direct control over which sources can connect." },
      { text: "Add a NACL rule on the private subnets.", correct: false, why: "The ALB lives in the public subnets — private-subnet NACLs are the wrong control point." },
      { text: "Use a Route 53 geolocation policy.", correct: false, why: "DNS policies influence which record is returned; anyone with the ALB DNS name can still connect." },
      { text: "Enable Shield Advanced.", correct: false, why: "Shield mitigates DDoS; it does not implement IP allowlisting." },
    ],
  },
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A team needs automated vulnerability scanning of EC2 instances and container images in ECR, with findings prioritized by severity. Which service does this?",
    options: [
      { text: "Amazon Inspector", correct: true, why: "Inspector continuously scans EC2, ECR images, and Lambda for CVEs and produces risk-scored findings." },
      { text: "Amazon Macie", correct: false, why: "Macie classifies sensitive data in S3, not software vulnerabilities." },
      { text: "AWS Security Hub alone", correct: false, why: "Security Hub aggregates findings from other services; it is not itself a scanner." },
      { text: "AWS Firewall Manager", correct: false, why: "Firewall Manager centrally administers WAF/Shield/security group policies, not vulnerability scans." },
    ],
  },

  // ============================================================
  // VPC & Hybrid Connectivity
  // ============================================================
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "EC2 instances in private subnets must access S3 without traffic traversing the internet. What should the architect configure?",
    options: [
      { text: "A NAT gateway in a public subnet.", correct: false, why: "A NAT gateway routes traffic out through the internet, which the requirement forbids (and adds cost)." },
      { text: "A gateway VPC endpoint for S3.", correct: true, why: "Gateway endpoints route S3 traffic over the AWS private network — no internet path and no data-processing charge." },
      { text: "An internet gateway with restrictive security groups.", correct: false, why: "An internet gateway is by definition an internet path." },
      { text: "AWS Direct Connect.", correct: false, why: "Direct Connect links on-premises networks to AWS; it is irrelevant for VPC-to-S3 traffic." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A SaaS provider wants to expose an API running behind a Network Load Balancer to hundreds of customer VPCs. Traffic must stay on the AWS network, and the provider must not peer with or route to customer VPCs. Which solution meets these requirements?",
    options: [
      { text: "AWS PrivateLink — customers create interface VPC endpoints to the provider's endpoint service.", correct: true, why: "PrivateLink exposes only the service, scales to thousands of consumers, and requires no peering, route table changes, or overlapping-CIDR concerns." },
      { text: "VPC peering with every customer VPC.", correct: false, why: "Peering at that scale is unmanageable, exposes the whole network, and breaks with overlapping CIDRs." },
      { text: "A Transit Gateway shared with all customers.", correct: false, why: "A shared Transit Gateway interconnects entire networks — far more access than exposing one service, and CIDR overlap is still a problem." },
      { text: "Public API with customer IP allowlists.", correct: false, why: "Traffic would traverse the public internet, which the requirement explicitly forbids." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A company has grown to 40 VPCs across several accounts plus an on-premises data center connected via Direct Connect. Managing full-mesh VPC peering has become unmanageable. What should the architect implement?",
    options: [
      { text: "AWS Transit Gateway as a central hub attaching all VPCs and the Direct Connect gateway.", correct: true, why: "Transit Gateway replaces the peering mesh with hub-and-spoke routing that scales to thousands of attachments, including hybrid connectivity." },
      { text: "Continue peering but automate it with CloudFormation.", correct: false, why: "Automation eases creation but the O(n²) mesh, route-table limits, and no-transitive-routing problem remain." },
      { text: "PrivateLink endpoints between every pair of VPCs.", correct: false, why: "PrivateLink shares individual services, not full network connectivity between VPCs." },
      { text: "A VPN connection between each VPC pair.", correct: false, why: "Pairwise VPNs are slower, costlier, and even harder to manage than peering." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "Instances in private subnets across three AZs reach the internet through a single NAT gateway in AZ-a. What is the resilience risk?",
    options: [
      { text: "If AZ-a fails, instances in all three AZs lose outbound internet access.", correct: true, why: "A NAT gateway is a zonal resource — best practice is one per AZ with per-AZ route tables." },
      { text: "NAT gateways cannot handle traffic from multiple AZs.", correct: false, why: "They can route cross-AZ traffic fine; the issue is availability, not capability." },
      { text: "There is no risk; NAT gateways are regional.", correct: false, why: "NAT gateways live in a specific AZ, unlike internet gateways which are regional." },
      { text: "Cross-AZ NAT traffic is blocked by default.", correct: false, why: "Nothing blocks it — you just pay cross-AZ data charges and accept the single-AZ dependency." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design Resilient Architectures",
    pick: 2,
    question:
      "A company connects its data center to AWS with a single Direct Connect link. An audit flags the connection as a single point of failure for hybrid workloads. Which TWO actions improve resilience?",
    options: [
      { text: "Add a second Direct Connect connection at a different Direct Connect location.", correct: true, why: "A second DX link in a separate facility removes the single-location failure mode with consistent performance." },
      { text: "Configure an AWS Site-to-Site VPN as a lower-cost failover path.", correct: true, why: "A VPN over the internet is the standard economical backup for Direct Connect failure." },
      { text: "Enable cross-zone load balancing on the ALB.", correct: false, why: "Cross-zone balancing concerns traffic inside AWS, not the hybrid link." },
      { text: "Move workloads to a single AZ to reduce network paths.", correct: false, why: "Concentrating into one AZ reduces resilience — the opposite of the goal." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "After migrating to hybrid cloud, on-premises servers must resolve private DNS names hosted in a Route 53 private hosted zone, and EC2 instances must resolve on-premises hostnames. What enables this?",
    options: [
      { text: "Route 53 Resolver inbound and outbound endpoints with forwarding rules.", correct: true, why: "Inbound endpoints let on-prem query the private zone; outbound endpoints forward VPC queries to on-prem DNS servers." },
      { text: "A public hosted zone duplicating the private records.", correct: false, why: "Publishing internal names publicly is a security leak and doesn't solve EC2→on-prem resolution." },
      { text: "Hard-coding IPs in /etc/hosts on both sides.", correct: false, why: "Static host files rot immediately in any environment with changing IPs." },
      { text: "An internet-facing DNS proxy on EC2.", correct: false, why: "A self-managed public proxy adds an attack surface and operational burden Route 53 Resolver eliminates." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A hybrid application requires consistent, dedicated bandwidth of 10 Gbps between the on-premises data center and AWS, with predictable latency. Which connectivity option should be chosen?",
    options: [
      { text: "AWS Direct Connect", correct: true, why: "Direct Connect provides a dedicated private circuit with consistent bandwidth and latency, unlike the public internet." },
      { text: "AWS Site-to-Site VPN", correct: false, why: "VPN rides the public internet, so bandwidth and latency vary and per-tunnel throughput is limited." },
      { text: "AWS Transit Gateway alone", correct: false, why: "Transit Gateway routes traffic within AWS; it is not itself a link to on-premises." },
      { text: "AWS Global Accelerator", correct: false, why: "Global Accelerator optimizes internet paths to AWS endpoints, not a dedicated private circuit." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "EC2 instances in a private subnet with no internet route must call the Amazon SQS API. What is the correct solution?",
    options: [
      { text: "Create an interface VPC endpoint (PrivateLink) for SQS in the VPC.", correct: true, why: "Interface endpoints put an ENI for the AWS service inside your subnet, so API calls never leave the AWS network." },
      { text: "Create a gateway VPC endpoint for SQS.", correct: false, why: "Gateway endpoints exist only for S3 and DynamoDB; every other service uses interface endpoints." },
      { text: "Add an internet gateway route to the private subnet.", correct: false, why: "That makes the subnet public, contradicting the design." },
      { text: "Use a NAT gateway and accept the internet path.", correct: false, why: "It would work but sends traffic over the internet and adds per-GB charges an endpoint avoids." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "Two VPCs in different Regions must exchange private traffic, and both are managed by the same company with non-overlapping CIDRs. Traffic volume is modest and only these two VPCs are involved. What is the simplest solution?",
    options: [
      { text: "Inter-Region VPC peering", correct: true, why: "For a single pair of VPCs, peering is the simplest, lowest-cost private connection with no hourly hub charge." },
      { text: "Transit Gateway peering between Regions", correct: false, why: "Correct at scale, but adds Transit Gateway cost and complexity for just two VPCs." },
      { text: "Site-to-Site VPN between the VPCs", correct: false, why: "VPN adds encryption overhead and lower throughput where peering already keeps traffic on the AWS backbone." },
      { text: "AWS PrivateLink", correct: false, why: "PrivateLink exposes individual services, not general VPC-to-VPC connectivity." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "An architect designs a VPC where web servers must be reachable from the internet and database servers must not be. What is the standard design?",
    options: [
      { text: "Web servers in public subnets with a route to an internet gateway; databases in private subnets with no such route.", correct: true, why: "Subnet tier separation by route table is the fundamental VPC pattern for exposing only what must be public." },
      { text: "All servers in public subnets, secured only by security groups.", correct: false, why: "It works technically but removes the network-layer defense in depth the exam expects." },
      { text: "All servers in private subnets with an internet gateway attached to the database subnet.", correct: false, why: "Adding an IGW route to the database subnet makes it public — the exact opposite of the requirement." },
      { text: "Web and database servers in different Regions.", correct: false, why: "Cross-Region separation adds latency and complexity without addressing subnet-level exposure." },
    ],
  },

  // ============================================================
  // DNS, CDN & Global Traffic
  // ============================================================
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A company runs its primary site in us-east-1 and a standby copy in eu-west-1. Route 53 should send all traffic to the primary and switch to the standby only when the primary is unhealthy. Which routing policy is required?",
    options: [
      { text: "Failover routing with health checks", correct: true, why: "Failover routing is purpose-built for active-passive: it serves the secondary only when the primary health check fails." },
      { text: "Weighted routing 50/50", correct: false, why: "Weighted routing splits traffic between both sites all the time, which is active-active, not standby." },
      { text: "Geolocation routing", correct: false, why: "Geolocation routes by the user's location and does not react to endpoint health by design." },
      { text: "Simple routing with two records", correct: false, why: "Simple routing cannot use health checks, so traffic would keep flowing to the dead site." },
    ],
  },
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A media site serves the same images and videos to millions of global users from S3. Latency and S3 request costs are both concerns. What should be added?",
    options: [
      { text: "Amazon CloudFront distribution with the S3 bucket as origin.", correct: true, why: "Edge caching serves content near users, cutting latency and slashing repeated S3 GET requests." },
      { text: "S3 Intelligent-Tiering.", correct: false, why: "Intelligent-Tiering optimizes storage cost per object; it doesn't reduce latency or request count." },
      { text: "AWS Global Accelerator.", correct: false, why: "Global Accelerator optimizes routing to regional endpoints but does not cache content." },
      { text: "Larger multipart chunk sizes.", correct: false, why: "Chunk size tuning helps big single transfers, not millions of repeated downloads." },
    ],
  },
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A multiplayer game uses UDP and needs static IP addresses plus the lowest possible latency for global users reaching Regional endpoints. Which service fits?",
    options: [
      { text: "AWS Global Accelerator", correct: true, why: "Global Accelerator provides two static anycast IPs and routes TCP/UDP over the AWS backbone to the nearest healthy endpoint." },
      { text: "Amazon CloudFront", correct: false, why: "CloudFront is HTTP/HTTPS content delivery — it cannot proxy arbitrary UDP game traffic." },
      { text: "Route 53 latency-based routing", correct: false, why: "It picks a good Region at DNS time but offers no static IPs and traffic still rides the public internet." },
      { text: "An ALB with cross-zone load balancing", correct: false, why: "ALBs are HTTP-only and regional, with no static IPs." },
    ],
  },
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "An application is deployed in four Regions. Users should always be routed to the Region that gives them the fastest response time. Which Route 53 policy should be used?",
    options: [
      { text: "Latency-based routing", correct: true, why: "Latency-based routing sends each user to the Region with the lowest measured network latency from their location." },
      { text: "Geolocation routing", correct: false, why: "Geolocation routes by the user's country, which is not always the lowest-latency Region." },
      { text: "Weighted routing", correct: false, why: "Weighted routing splits traffic by ratio regardless of performance." },
      { text: "Multivalue answer routing", correct: false, why: "Multivalue returns several healthy records at random — it is a poor man's load balancer, not latency aware." },
    ],
  },
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A streaming service must ensure that premium video files in CloudFront can only be downloaded by paying subscribers, using time-limited URLs. What should be implemented?",
    options: [
      { text: "CloudFront signed URLs or signed cookies.", correct: true, why: "Signed URLs/cookies grant time-limited, policy-bound access to specific CloudFront content." },
      { text: "A public CloudFront distribution with obscure file names.", correct: false, why: "Security by obscurity — anyone who obtains or guesses the URL keeps access forever." },
      { text: "S3 bucket ACLs granting each subscriber access.", correct: false, why: "S3 ACLs do not scale to end users and don't apply to CloudFront delivery." },
      { text: "AWS WAF rate limiting.", correct: false, why: "Rate limiting throttles abuse but does not authenticate paying subscribers." },
    ],
  },
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A company wants to gradually shift 10% of production traffic to a new application version running on separate infrastructure, increasing the share over time. Which Route 53 policy supports this?",
    options: [
      { text: "Weighted routing", correct: true, why: "Weighted records let you dial the percentage of traffic to each version for canary and blue/green rollouts." },
      { text: "Failover routing", correct: false, why: "Failover is binary — all traffic to primary until it fails." },
      { text: "Geolocation routing", correct: false, why: "Geolocation splits by user location, not by controllable percentage." },
      { text: "Simple routing", correct: false, why: "Simple routing offers no traffic-splitting control at all." },
    ],
  },
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A dynamic web application delivered through CloudFront needs to run lightweight logic — such as A/B test header rewriting — on every request at the edge with sub-millisecond overhead and no state. What should be used?",
    options: [
      { text: "CloudFront Functions", correct: true, why: "CloudFront Functions run JavaScript at edge locations in sub-millisecond time, ideal for header and URL manipulation." },
      { text: "Lambda@Edge", correct: false, why: "Lambda@Edge is more capable but runs at regional edge caches with higher latency and cost than needed here." },
      { text: "An EC2 fleet behind the distribution", correct: false, why: "Adding origin compute defeats the purpose of doing the work at the edge." },
      { text: "API Gateway request mapping templates", correct: false, why: "API Gateway is a regional service and is not in the CloudFront request path by default." },
    ],
  },
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "During a Region evacuation test, DNS changes took over an hour to take effect for many users. What is the most likely cause and fix?",
    options: [
      { text: "The record's TTL was set too high — lower the TTL well before a planned failover.", correct: true, why: "Resolvers cache records for the TTL duration, so a long TTL delays how quickly clients see the new endpoint." },
      { text: "Route 53 health checks were disabled — enable them.", correct: false, why: "Health checks affect when Route 53 changes its answer, not how long clients cache the old one." },
      { text: "The hosted zone was private — make it public.", correct: false, why: "Zone type doesn't govern propagation speed." },
      { text: "Alias records propagate slower than CNAMEs — switch to CNAME.", correct: false, why: "Alias records are not slower; they're generally preferred and free for AWS targets." },
    ],
  },

  // ============================================================
  // Compute, Containers & Scaling
  // ============================================================
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A stateless web application must remain available even if an entire Availability Zone fails, while scaling with demand. Which architecture achieves this?",
    options: [
      { text: "An Auto Scaling group spanning multiple AZs behind an Application Load Balancer.", correct: true, why: "The ALB spreads traffic across AZs and the ASG replaces capacity automatically when an AZ is lost." },
      { text: "One large EC2 instance with detailed monitoring.", correct: false, why: "A single instance is a single point of failure no matter how well you monitor it." },
      { text: "Two EC2 instances in the same AZ behind an ALB.", correct: false, why: "Everything in one AZ still goes down together when that AZ fails." },
      { text: "An Auto Scaling group in one AZ with scheduled scaling.", correct: false, why: "Scheduled scaling handles predictable load, not AZ failure — a single AZ remains the weak point." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A tightly coupled HPC workload needs the lowest network latency and highest throughput between EC2 instances. Which placement strategy should be used?",
    options: [
      { text: "Cluster placement group", correct: true, why: "Cluster groups pack instances close together in one AZ for maximum per-flow throughput and lowest latency." },
      { text: "Spread placement group", correct: false, why: "Spread does the opposite — it separates instances onto distinct racks for fault isolation." },
      { text: "Partition placement group", correct: false, why: "Partition groups isolate groups of instances across racks, designed for big distributed systems like Hadoop." },
      { text: "Instances in different AZs for parallelism", correct: false, why: "Cross-AZ links add latency — exactly what HPC inter-node traffic must avoid." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A team wants to run containerized microservices on AWS with the LEAST operational overhead — no cluster instances to patch, scale, or capacity-plan. Which compute option should they choose?",
    options: [
      { text: "Amazon ECS with AWS Fargate launch type", correct: true, why: "Fargate runs containers serverlessly — AWS manages the underlying hosts entirely, billed per task vCPU/memory." },
      { text: "Amazon ECS with the EC2 launch type", correct: false, why: "EC2 launch type means you still patch, scale, and right-size the container instances." },
      { text: "Self-managed Kubernetes on EC2", correct: false, why: "Running your own control plane and nodes is the maximum operational overhead option." },
      { text: "Amazon EKS with self-managed node groups", correct: false, why: "EKS manages the control plane, but self-managed nodes still leave instance operations on the team." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "An Auto Scaling group must keep average CPU utilization near 60% as traffic varies unpredictably throughout the day. Which scaling policy is the best fit?",
    options: [
      { text: "Target tracking scaling on average CPU utilization", correct: true, why: "Target tracking automatically adds or removes capacity to hold the metric at the chosen target, like a thermostat." },
      { text: "Scheduled scaling at fixed times", correct: false, why: "Schedules only work when load is predictable by clock time." },
      { text: "Manual scaling by the on-call engineer", correct: false, why: "Human reaction time cannot track unpredictable intraday traffic." },
      { text: "Simple scaling with a long cooldown", correct: false, why: "Simple scaling reacts in coarse steps with cooldown delays; target tracking is the modern recommendation." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "An application must route traffic to different backend target groups based on the URL path (/api and /images). Which load balancer should be used?",
    options: [
      { text: "Application Load Balancer with path-based routing rules", correct: true, why: "ALBs operate at layer 7 and can route by path, host header, query string, and more." },
      { text: "Network Load Balancer", correct: false, why: "NLB works at layer 4 (TCP/UDP) and cannot inspect URL paths." },
      { text: "Gateway Load Balancer", correct: false, why: "GWLB is for inserting third-party network appliances, not application routing." },
      { text: "Classic Load Balancer", correct: false, why: "The CLB is legacy with only basic layer 4/7 support and no path-based rules." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A TCP-based application requires millions of requests per second with ultra-low latency and a static IP per Availability Zone. Which load balancer meets this?",
    options: [
      { text: "Network Load Balancer", correct: true, why: "NLB handles millions of requests per second at ultra-low latency and supports static/Elastic IPs per AZ." },
      { text: "Application Load Balancer", correct: false, why: "ALB is HTTP-focused, adds layer 7 processing latency, and has no static IPs." },
      { text: "Classic Load Balancer", correct: false, why: "The legacy CLB cannot match NLB performance and lacks static IP support." },
      { text: "Route 53 with multivalue answers", correct: false, why: "DNS round-robin is not a load balancer and offers no connection-level performance guarantees." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "Instances behind an ALB are being marked healthy by EC2 status checks but are returning HTTP 500 errors, and traffic keeps flowing to them. What should be configured?",
    options: [
      { text: "ELB health checks against an application endpoint, with the ASG set to use ELB health check type.", correct: true, why: "Only application-level health checks detect a broken app on a running instance, and the ASG must honor them to replace it." },
      { text: "Increase the instance size.", correct: false, why: "A bigger instance still returns 500s if the application is broken." },
      { text: "Enable detailed CloudWatch monitoring.", correct: false, why: "More metrics improve visibility but do not remove unhealthy targets from rotation." },
      { text: "Enable cross-zone load balancing.", correct: false, why: "That evens traffic distribution; it does not detect application failure." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A Lambda-backed API shows occasional multi-second response times on the first request after idle periods, which violates its latency SLA. What addresses this directly?",
    options: [
      { text: "Enable provisioned concurrency on the function.", correct: true, why: "Provisioned concurrency keeps execution environments initialized, eliminating cold-start latency." },
      { text: "Increase the function timeout.", correct: false, why: "A longer timeout permits slow requests; it does not make them fast." },
      { text: "Increase the function's memory to the maximum.", correct: false, why: "More memory speeds execution somewhat but does not remove cold starts." },
      { text: "Move the function into a VPC.", correct: false, why: "VPC attachment historically added networking setup time — it does not help and can hurt." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A legacy application stores user session data in memory on each EC2 instance, so users are logged out whenever the Auto Scaling group replaces an instance. What is the best fix?",
    options: [
      { text: "Store session state externally in ElastiCache or DynamoDB.", correct: true, why: "Externalizing session state makes instances stateless and freely replaceable — the standard cloud pattern." },
      { text: "Enable sticky sessions on the load balancer.", correct: false, why: "Stickiness pins a user to one instance, so sessions still vanish when that instance is replaced." },
      { text: "Disable Auto Scaling termination.", correct: false, why: "Blocking replacement sacrifices elasticity and self-healing to hide the design flaw." },
      { text: "Increase instance memory.", correct: false, why: "Session loss is caused by instance replacement, not memory pressure." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A workload runs on EC2 continuously but the team is unsure whether it will stay on m6i instances or move to a different family within a year. Which purchase option offers a discount with that flexibility?",
    options: [
      { text: "Compute Savings Plans", correct: true, why: "Compute Savings Plans apply across instance families, sizes, Regions, Fargate, and Lambda for a spend commitment." },
      { text: "Standard Reserved Instances for m6i", correct: false, why: "Standard RIs lock in the family, removing exactly the flexibility the team needs." },
      { text: "Spot Instances", correct: false, why: "Spot capacity can be reclaimed with two minutes' notice — not for steady production." },
      { text: "Dedicated Hosts", correct: false, why: "Dedicated Hosts are for licensing and compliance and cost the most." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design Resilient Architectures",
    pick: 2,
    question:
      "A batch-processing fleet uses Spot Instances to save cost, but jobs sometimes fail when instances are reclaimed. Which TWO practices improve resilience?",
    options: [
      { text: "Handle the two-minute Spot interruption notice to checkpoint work and drain gracefully.", correct: true, why: "The interruption notice lets the application save progress before the instance is reclaimed." },
      { text: "Use a diversified Spot fleet across multiple instance types and AZs.", correct: true, why: "Diversification reduces the chance that a single capacity pool shortage takes out the whole fleet." },
      { text: "Set the Spot maximum price to the On-Demand price and assume no interruptions.", correct: false, why: "Price does not prevent reclamation — interruptions are driven by capacity, not just bid." },
      { text: "Store job state only in instance store volumes.", correct: false, why: "Instance store data is destroyed on termination, guaranteeing loss on interruption." },
    ],
  },

  // ============================================================
  // Storage
  // ============================================================
  {
    topic: "Storage",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "Hundreds of EC2 instances in multiple AZs need shared, concurrent access to the same POSIX file system. Which storage service fits?",
    options: [
      { text: "Amazon EFS", correct: true, why: "EFS is a managed NFS file system mountable from many instances across AZs simultaneously." },
      { text: "Amazon EBS with Multi-Attach", correct: false, why: "Multi-Attach is limited to io1/io2 volumes, a handful of instances, and a single AZ." },
      { text: "S3 mounted via third-party FUSE driver", correct: false, why: "S3 is object storage; FUSE mounts don't provide reliable POSIX semantics like locking." },
      { text: "EC2 instance store shared over SMB", correct: false, why: "Instance store is ephemeral and local to one instance — data disappears when the instance stops." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "Compliance requires that objects written to an S3 bucket in us-east-1 are automatically copied to a bucket in ap-southeast-2. What is the simplest solution?",
    options: [
      { text: "S3 Cross-Region Replication (CRR)", correct: true, why: "CRR replicates new objects to a destination bucket in another Region automatically once versioning is enabled." },
      { text: "A cron job running aws s3 sync every hour.", correct: false, why: "It works but is self-managed, adds up to an hour of data-loss window, and is not the simplest option." },
      { text: "S3 Transfer Acceleration", correct: false, why: "Transfer Acceleration speeds up client uploads to one bucket; it does not copy data between buckets." },
      { text: "AWS DataSync scheduled hourly", correct: false, why: "DataSync can do it, but CRR is native, continuous, and requires no scheduling." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "Users worldwide upload large files to a single S3 bucket in us-east-1 and complain about slow uploads from distant locations. What is the simplest fix?",
    options: [
      { text: "Enable S3 Transfer Acceleration on the bucket.", correct: true, why: "Uploads enter the nearest CloudFront edge location and ride AWS's optimized backbone to the bucket." },
      { text: "Ask users to upload during off-peak hours.", correct: false, why: "The bottleneck is distance/latency, not time-of-day congestion on AWS's side." },
      { text: "Create buckets in every Region and merge nightly.", correct: false, why: "This adds heavy operational complexity compared to a single checkbox feature." },
      { text: "Use EC2 as an upload proxy in each Region.", correct: false, why: "Self-managed proxies duplicate what Transfer Acceleration provides natively." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A database on EC2 needs a sustained 200,000 IOPS on a single EBS volume with sub-millisecond latency. Which volume type is required?",
    options: [
      { text: "io2 Block Express (Provisioned IOPS SSD)", correct: true, why: "io2 Block Express scales to 256,000 IOPS per volume with consistent sub-millisecond latency." },
      { text: "gp3 (General Purpose SSD)", correct: false, why: "gp3 is the general-purpose tier and tops out far below 200,000 IOPS per volume." },
      { text: "st1 (Throughput Optimized HDD)", correct: false, why: "st1 is a spinning-disk tier for sequential throughput, not high IOPS." },
      { text: "sc1 (Cold HDD)", correct: false, why: "sc1 is the lowest-performance, lowest-cost HDD tier — the opposite of this requirement." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A company is migrating a Windows application that requires shared storage accessed via SMB with Active Directory integration. Which service should be used?",
    options: [
      { text: "Amazon FSx for Windows File Server", correct: true, why: "FSx for Windows is a fully managed SMB file system with native Active Directory integration." },
      { text: "Amazon EFS", correct: false, why: "EFS speaks NFS and targets Linux clients — no native SMB or AD support." },
      { text: "Amazon FSx for Lustre", correct: false, why: "Lustre is for high-performance computing scratch storage, not Windows SMB shares." },
      { text: "S3 with File Gateway", correct: false, why: "File Gateway is meant for on-premises access to S3, an awkward fit for a native cloud Windows app." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "Log files in S3 are read frequently for 30 days, rarely for the next 60 days, and must be kept for 7 years for compliance (retrieval time of hours is acceptable). What is the most cost-effective lifecycle?",
    options: [
      { text: "S3 Standard → S3 Standard-IA after 30 days → S3 Glacier Deep Archive after 90 days.", correct: true, why: "Each tier matches the access pattern, and Deep Archive is the cheapest storage for long-term compliance data." },
      { text: "Keep everything in S3 Standard for 7 years.", correct: false, why: "Standard is the most expensive tier — wasteful for data that's almost never read." },
      { text: "Move to Glacier Deep Archive immediately.", correct: false, why: "The first 30 days of frequent reads would incur slow, per-retrieval charges." },
      { text: "Store on EBS volumes attached to a logging instance.", correct: false, why: "EBS costs far more than S3 tiers and adds an instance to maintain." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "Object access patterns in a data lake are unknown and change unpredictably. Which S3 storage class optimizes cost automatically without retrieval fees?",
    options: [
      { text: "S3 Intelligent-Tiering", correct: true, why: "Intelligent-Tiering moves objects between access tiers automatically based on usage, with no retrieval fees." },
      { text: "S3 Standard-IA", correct: false, why: "Standard-IA charges per-GB retrieval fees, which sting when 'infrequent' objects turn hot." },
      { text: "S3 One Zone-IA", correct: false, why: "One Zone-IA adds retrieval fees AND lower durability by storing in a single AZ." },
      { text: "S3 Glacier Flexible Retrieval", correct: false, why: "Glacier retrievals take minutes to hours — wrong for data that might be accessed at any time." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "An on-premises file server is running out of space. Users need continued low-latency SMB access to recently used files, while the full data set should live cheaply in S3. Which solution fits?",
    options: [
      { text: "AWS Storage Gateway — Amazon S3 File Gateway with local cache.", correct: true, why: "File Gateway presents SMB/NFS shares backed by S3, caching hot files locally for low-latency access." },
      { text: "Mount an EFS file system over the internet.", correct: false, why: "EFS is designed for access from within AWS networks; WAN-mounting NFS gives poor latency and EFS costs far more than S3." },
      { text: "Sync everything to every user's laptop.", correct: false, why: "Full local copies multiply storage use — the opposite of offloading." },
      { text: "Replace the file server with larger disks.", correct: false, why: "Buying hardware continues the capex cycle the company is trying to escape and ignores the S3 requirement." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A developer accidentally overwrote several important objects in an S3 bucket. What feature would have allowed immediate recovery of the previous content?",
    options: [
      { text: "S3 Versioning", correct: true, why: "Versioning retains every prior version of an object, so an overwrite can be rolled back instantly." },
      { text: "S3 Lifecycle policies", correct: false, why: "Lifecycle rules transition or expire objects; they do not preserve overwritten content." },
      { text: "S3 Storage Lens", correct: false, why: "Storage Lens reports usage and activity metrics — it stores no data copies." },
      { text: "S3 Transfer Acceleration", correct: false, why: "A transfer performance feature with no recovery capability." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A machine learning training job on EC2 needs a shared file system delivering hundreds of GB/s throughput with sub-millisecond latency, linked to a data set in S3. Which service should be used?",
    options: [
      { text: "Amazon FSx for Lustre", correct: true, why: "FSx for Lustre is built for HPC/ML workloads and can transparently present and sync an S3 data set." },
      { text: "Amazon EFS Standard", correct: false, why: "EFS scales well but cannot match Lustre's throughput and latency for HPC-class training." },
      { text: "EBS gp3 volumes on each instance", correct: false, why: "EBS volumes are not shared across many instances and would require manual data distribution." },
      { text: "S3 accessed directly per file", correct: false, why: "Direct object GETs per training file add latency that a parallel file system removes." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "Easily reproducible temporary data (rendered thumbnails) is stored in S3 and accessed a few times a month. Losing it would only mean regenerating it. What is the cheapest sensible storage class?",
    options: [
      { text: "S3 One Zone-IA", correct: true, why: "One Zone-IA costs about 20% less than Standard-IA and its single-AZ durability is acceptable for reproducible data." },
      { text: "S3 Standard", correct: false, why: "Paying the top tier for rarely accessed, regenerable data wastes money." },
      { text: "S3 Glacier Deep Archive", correct: false, why: "Monthly access with hours-long retrieval times would break the application's usability." },
      { text: "S3 Standard-IA", correct: false, why: "Reasonable, but One Zone-IA is cheaper and its lower durability is fine here." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design Cost-Optimized Architectures",
    pick: 2,
    question:
      "An S3 bucket's cost is unexpectedly high. Investigation shows many incomplete multipart uploads and thousands of old object versions. Which TWO lifecycle actions reduce cost?",
    options: [
      { text: "Add a lifecycle rule to abort incomplete multipart uploads after 7 days.", correct: true, why: "Orphaned multipart parts are billed as storage indefinitely until explicitly aborted." },
      { text: "Add a lifecycle rule to expire or transition noncurrent object versions.", correct: true, why: "Old versions accumulate silently and are billed at full rate unless a noncurrent-version rule handles them." },
      { text: "Disable versioning to delete existing versions.", correct: false, why: "Suspending versioning stops new versions but does not delete the existing ones already billed." },
      { text: "Enable Transfer Acceleration.", correct: false, why: "That adds a per-GB charge — it increases cost rather than reducing it." },
    ],
  },

  // ============================================================
  // Databases
  // ============================================================
  {
    topic: "Databases",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A production MySQL database on RDS must survive an Availability Zone failure with automatic failover and no manual intervention. What should you enable?",
    options: [
      { text: "Multi-AZ deployment", correct: true, why: "Multi-AZ keeps a synchronous standby in another AZ and fails over automatically, usually within a minute or two." },
      { text: "A read replica in the same AZ", correct: false, why: "Same-AZ replicas die with the AZ, and replica promotion is a manual step anyway." },
      { text: "Automated daily snapshots", correct: false, why: "Snapshots let you restore eventually, but restoring is manual and loses data since the last snapshot." },
      { text: "An ElastiCache cluster in front of RDS", correct: false, why: "A cache improves read performance; it does not provide database failover." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A global application requires its Aurora MySQL database to fail over to another Region with an RPO of about 1 second and an RTO of under 1 minute. Which solution meets these targets?",
    options: [
      { text: "Aurora Global Database with a secondary Region cluster.", correct: true, why: "Aurora Global Database replicates with typical sub-second lag and can promote a secondary Region in under a minute." },
      { text: "Cross-Region automated snapshots every hour.", correct: false, why: "Hourly snapshots mean up to an hour of data loss and a slow restore — misses both targets." },
      { text: "RDS Multi-AZ deployment.", correct: false, why: "Multi-AZ fails over within one Region only; it does not survive a Regional outage." },
      { text: "AWS Backup with cross-Region copy.", correct: false, why: "Backup copies are point-in-time and restoring a cluster takes far longer than one minute." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A globally used gaming app needs a DynamoDB table that is readable AND writable with low latency from multiple Regions. What should you use?",
    options: [
      { text: "DynamoDB global tables", correct: true, why: "Global tables provide multi-Region, multi-active replication with local read/write latency in every Region." },
      { text: "DynamoDB with DAX", correct: false, why: "DAX accelerates reads in one Region; it does not replicate the table across Regions." },
      { text: "A single-Region table with CloudFront in front", correct: false, why: "CloudFront caches HTTP content; it cannot serve DynamoDB writes from other Regions." },
      { text: "Nightly export/import between Regional tables", correct: false, why: "Batch copies mean stale data and no multi-Region writes." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A read-heavy web app repeatedly queries the same product catalog data from RDS, causing high database load. What is the BEST way to reduce the load?",
    options: [
      { text: "Add an ElastiCache (Redis) layer to cache frequent reads.", correct: true, why: "Caching hot, repetitive reads in memory offloads the database and returns results in microseconds." },
      { text: "Upgrade to a larger RDS instance class.", correct: false, why: "Vertical scaling buys headroom but is costlier and doesn't address the repetitive-read pattern." },
      { text: "Convert the database to DynamoDB.", correct: false, why: "A migration is a huge change and repetitive reads would still hit the datastore without a cache." },
      { text: "Enable RDS storage autoscaling.", correct: false, why: "Storage autoscaling grows disk space; it does nothing for query load." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "An RDS MySQL database is overwhelmed by read traffic from reporting dashboards, while writes are light. What is the most direct fix?",
    options: [
      { text: "Add RDS read replicas and point the dashboards at them.", correct: true, why: "Read replicas offload read-only traffic, isolating reports from the primary's write workload." },
      { text: "Enable Multi-AZ.", correct: false, why: "The Multi-AZ standby is invisible to applications and serves no read traffic." },
      { text: "Shard the database across multiple primaries.", correct: false, why: "Sharding is a major re-architecture aimed at write scaling, overkill for read-heavy reporting." },
      { text: "Move reports to run against nightly S3 exports only.", correct: false, why: "Possible, but it changes data freshness and the reporting stack rather than directly fixing read scale." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A DynamoDB-backed application needs microsecond read latency for the same frequently read items, with minimal code changes. What should be used?",
    options: [
      { text: "DynamoDB Accelerator (DAX)", correct: true, why: "DAX is an API-compatible in-memory cache for DynamoDB delivering microsecond reads with near-zero code change." },
      { text: "ElastiCache Memcached with custom cache logic", correct: false, why: "It can work but requires writing and maintaining your own cache-aside code — not minimal change." },
      { text: "Increase provisioned RCUs", correct: false, why: "More RCUs add throughput, but DynamoDB reads stay at single-digit milliseconds, not microseconds." },
      { text: "DynamoDB global tables", correct: false, why: "Global tables address multi-Region access, not per-item read latency." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A new SaaS product's PostgreSQL workload is highly unpredictable — near zero at night, sharp spikes during business hours. The team wants capacity that scales automatically and bills only for what is used, without managing instances. What should they choose?",
    options: [
      { text: "Aurora Serverless v2", correct: true, why: "Serverless v2 scales database capacity (ACUs) up and down in fine-grained steps within seconds and bills per capacity-second." },
      { text: "RDS PostgreSQL on a large fixed instance.", correct: false, why: "A fixed instance is either overpaying at night or underpowered at peak." },
      { text: "RDS with storage autoscaling.", correct: false, why: "Storage autoscaling grows disk space, not compute capacity." },
      { text: "Self-managed PostgreSQL on Spot Instances.", correct: false, why: "Spot interruptions are unacceptable for a stateful primary database, and self-managing contradicts the requirement." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design High-Performing Architectures",
    pick: 2,
    question:
      "An Aurora MySQL cluster is saturated by read traffic while writes remain modest. Which TWO steps scale read performance the recommended way?",
    options: [
      { text: "Add Aurora Replicas to the cluster.", correct: true, why: "Aurora supports up to 15 low-lag replicas sharing the cluster storage volume for read scaling." },
      { text: "Point read-only application traffic at the cluster reader endpoint.", correct: true, why: "The reader endpoint automatically load-balances connections across all replicas — no custom routing code." },
      { text: "Enable Multi-AZ on the writer.", correct: false, why: "Failover standbys improve availability; they do not serve reads in Aurora's model (replicas do)." },
      { text: "Double the writer instance size.", correct: false, why: "Vertical scaling of the writer is the costly, ceiling-limited way to absorb read traffic replicas should handle." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "An application needs single-digit millisecond lookups by a key with virtually unlimited scale and a flexible schema. Traffic is unpredictable. Which database should be chosen?",
    options: [
      { text: "Amazon DynamoDB with on-demand capacity", correct: true, why: "DynamoDB is a serverless key-value store with single-digit millisecond latency, and on-demand mode absorbs unpredictable traffic." },
      { text: "Amazon RDS for MySQL", correct: false, why: "A relational engine adds schema rigidity and vertical scaling limits this workload doesn't need." },
      { text: "Amazon Redshift", correct: false, why: "Redshift is a columnar analytics warehouse, not a low-latency operational key-value store." },
      { text: "Amazon Neptune", correct: false, why: "Neptune is a graph database for relationship traversal queries." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A DynamoDB table holds session records that are only useful for 24 hours. Storage costs are climbing as old items accumulate. What is the most efficient solution?",
    options: [
      { text: "Enable DynamoDB TTL on an expiry timestamp attribute.", correct: true, why: "TTL deletes expired items automatically at no extra write cost, keeping the table lean." },
      { text: "Run a nightly Lambda scan-and-delete job.", correct: false, why: "Scans and deletes consume capacity and cost money to do what TTL does for free." },
      { text: "Reduce provisioned RCUs.", correct: false, why: "Read capacity is unrelated to storage growth from stale items." },
      { text: "Move the table to a cheaper Region.", correct: false, why: "Region pricing differences don't address unbounded data growth." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "An analytics team must query production RDS data but must never be able to modify it, and their queries must not affect production performance. What should the architect do?",
    options: [
      { text: "Create a read replica and grant the team read-only credentials to it.", correct: true, why: "A replica isolates analytics load from production, and read-only credentials prevent modification." },
      { text: "Grant the team read-only access to the primary instance.", correct: false, why: "Read-only prevents writes but heavy analytics queries would still degrade production performance." },
      { text: "Give the team the application's database credentials.", correct: false, why: "Sharing application credentials grants write access and destroys accountability." },
      { text: "Enable Multi-AZ and let the team query the standby.", correct: false, why: "The Multi-AZ standby is not accessible for queries." },
    ],
  },

  // ============================================================
  // Decoupling & Integration
  // ============================================================
  {
    topic: "Decoupling & Integration",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "An order-processing service occasionally crashes and loses in-flight orders sent by the front end. How can the architecture be changed so orders are never lost?",
    options: [
      { text: "Put an SQS queue between the front end and the processing service.", correct: true, why: "SQS durably stores messages until a consumer successfully processes and deletes them, decoupling the two tiers." },
      { text: "Increase the processing instance size.", correct: false, why: "A bigger instance can still crash; in-flight requests are still lost." },
      { text: "Use SNS to fan out orders to the service.", correct: false, why: "Standard SNS is push-based fire-and-forget; if the subscriber is down retries eventually give up unless paired with a queue." },
      { text: "Enable EC2 auto-recovery.", correct: false, why: "Auto-recovery restarts the instance but anything held in memory at crash time is gone." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "An e-commerce order workflow involves payment, inventory check, shipping, and a manual fraud-review step that can take up to 3 days. Each step must retry on failure and the workflow state must be durable throughout. Which service should orchestrate this?",
    options: [
      { text: "AWS Step Functions standard workflow", correct: true, why: "Standard workflows durably track state for up to a year, with built-in retries, error handling, and human-approval wait patterns." },
      { text: "A chain of Lambda functions calling each other.", correct: false, why: "Lambda chaining loses state on failure and a 3-day wait vastly exceeds Lambda's 15-minute limit." },
      { text: "SQS with a single consumer polling all steps.", correct: false, why: "SQS moves messages but has no concept of workflow state, branching, or long waits." },
      { text: "EventBridge Scheduler running each step hourly.", correct: false, why: "Scheduled jobs are not a stateful workflow — no retries per step, no coordination between steps." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A payments service must process transactions for each customer in the exact order they were submitted, with no duplicate processing. Which messaging setup meets this?",
    options: [
      { text: "SQS FIFO queue with the customer ID as the message group ID and deduplication enabled.", correct: true, why: "FIFO queues guarantee per-group ordering and exactly-once processing within the deduplication window." },
      { text: "SQS standard queue with a large visibility timeout.", correct: false, why: "Standard queues are best-effort ordering and at-least-once delivery — duplicates and reordering can occur." },
      { text: "SNS topic with message filtering.", correct: false, why: "SNS is pub/sub fan-out; it provides neither strict ordering guarantees for this pattern nor deduplication for queue-less consumers." },
      { text: "Amazon Data Firehose.", correct: false, why: "Firehose batches data for delivery to storage destinations; it is not a transactional message queue." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design Resilient Architectures",
    pick: 2,
    question:
      "A microservice consuming from an SQS queue occasionally receives malformed messages that fail repeatedly and block the consumer with endless retries. Which TWO changes make the pipeline more resilient?",
    options: [
      { text: "Configure a dead-letter queue with a maxReceiveCount redrive policy.", correct: true, why: "After the set number of failed receives, poison messages move aside to the DLQ instead of looping forever." },
      { text: "Set up alarms/analysis on the dead-letter queue to inspect failed messages.", correct: true, why: "A DLQ only helps if someone is notified and can diagnose and replay the failures." },
      { text: "Increase the message retention period to 14 days.", correct: false, why: "Longer retention keeps the poison message around longer — it does nothing about repeated failures." },
      { text: "Switch the queue to FIFO.", correct: false, why: "FIFO adds ordering/dedup semantics; malformed messages would still fail and now also block their group." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "An architecture team wants order events from a custom application routed to three systems: analytics, billing, and email — each receiving only the event types it cares about, with the ability to add SaaS event sources later. Which service fits best?",
    options: [
      { text: "Amazon EventBridge with rules filtering events to each target.", correct: true, why: "EventBridge routes events by content-based rules to many targets and natively integrates SaaS and AWS service event sources." },
      { text: "An SQS queue polled by all three systems.", correct: false, why: "Each SQS message goes to one consumer — three systems can't all receive the same event from one queue." },
      { text: "Direct synchronous API calls from the app to each system.", correct: false, why: "Tight coupling means one slow or down consumer breaks order processing." },
      { text: "Kinesis Data Streams with one shard per system.", correct: false, why: "Sharding partitions data for throughput; it is not per-consumer content filtering, and SaaS integration isn't native." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "When a photo is uploaded to S3, three independent services must each receive a copy of the notification and process it in parallel. What is the standard pattern?",
    options: [
      { text: "S3 event notification to an SNS topic, with an SQS queue subscribed for each service (fan-out).", correct: true, why: "SNS fan-out delivers each event to all subscribers, and per-service queues buffer work durably." },
      { text: "S3 event notification directly to one SQS queue read by all three services.", correct: false, why: "Only one consumer receives each SQS message, so the three services would split events, not each get one." },
      { text: "Have each service poll the bucket with ListObjects every minute.", correct: false, why: "Polling is slow, expensive at scale, and error prone compared to event notifications." },
      { text: "Enable S3 Cross-Region Replication to three buckets.", correct: false, why: "Replication copies data, it does not notify processing services." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "Thousands of IoT sensors emit telemetry that must be ingested and processed in real time (sub-second) by multiple consumer applications, with the ability to replay the last 24 hours. Which service is designed for this?",
    options: [
      { text: "Amazon Kinesis Data Streams", correct: true, why: "Kinesis ingests streaming data at scale, lets multiple consumers read the same records, and retains them for replay." },
      { text: "Amazon SQS standard queue", correct: false, why: "Each SQS message is consumed by one consumer and deleted — no fan-out and no replay." },
      { text: "S3 with event notifications", correct: false, why: "S3 events work per uploaded object — batchy and higher latency than a stream." },
      { text: "AWS Batch", correct: false, why: "Batch schedules containerized batch jobs; it is not a real-time ingestion service." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A REST API on API Gateway backed by Lambda and RDS suffers when marketing campaigns cause sudden 20x traffic bursts; most requests fetch the same catalog data. What protects the backend with MINIMAL code changes?",
    options: [
      { text: "Enable API Gateway caching and set stage throttling limits.", correct: true, why: "Response caching absorbs repeated reads at the gateway and throttling caps the burst that reaches Lambda and RDS — zero code change." },
      { text: "Rewrite the API to use WebSockets.", correct: false, why: "Changing the protocol doesn't reduce backend load and is a major rewrite." },
      { text: "Move the API to a larger EC2 instance.", correct: false, why: "The API runs on managed services; the bottleneck is the burst reaching Lambda/RDS, not a server size." },
      { text: "Increase the Lambda timeout.", correct: false, why: "Longer timeouts make pileups worse under burst load, not better." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "Messages in an SQS queue are being processed more than once because the consumer sometimes takes longer than expected to finish. What is the most appropriate fix?",
    options: [
      { text: "Increase the visibility timeout to exceed the maximum processing time (or extend it while processing).", correct: true, why: "If the visibility timeout expires before deletion, the message becomes visible again and another consumer picks it up." },
      { text: "Increase the message retention period.", correct: false, why: "Retention governs how long unprocessed messages survive, not redelivery during processing." },
      { text: "Enable long polling.", correct: false, why: "Long polling reduces empty receives and cost; it has no effect on duplicate processing." },
      { text: "Switch to a larger consumer instance type.", correct: false, why: "Faster processing may mask the issue but the timeout mismatch remains the root cause." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "An API endpoint receives unpredictable, spiky traffic — sometimes zero requests for hours, sometimes short bursts. Which compute choice is most cost-effective?",
    options: [
      { text: "AWS Lambda behind API Gateway", correct: true, why: "Lambda bills per request and per millisecond of execution — idle time costs exactly nothing." },
      { text: "An always-on EC2 instance", correct: false, why: "You pay 24/7 for capacity that sits idle most of the time." },
      { text: "An ECS cluster with two always-running tasks", correct: false, why: "Same idle-cost problem as EC2, plus cluster management." },
      { text: "A 1-year Reserved Instance", correct: false, why: "Committing to steady usage for a spiky, mostly idle workload maximizes waste." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "An SQS consumer fleet generates a large number of empty ReceiveMessage responses, inflating request charges. What setting reduces this?",
    options: [
      { text: "Enable long polling by setting ReceiveMessageWaitTimeSeconds up to 20 seconds.", correct: true, why: "Long polling waits for messages to arrive instead of returning empty responses, cutting request count and cost." },
      { text: "Reduce the visibility timeout.", correct: false, why: "Visibility timeout affects redelivery, not empty receive volume." },
      { text: "Switch to a FIFO queue.", correct: false, why: "FIFO changes ordering semantics and costs more per request." },
      { text: "Increase the number of consumers.", correct: false, why: "More pollers produce more empty receives, increasing cost." },
    ],
  },

  // ============================================================
  // Analytics & Data Pipelines
  // ============================================================
  {
    topic: "Analytics & Data Pipelines",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "Clickstream events must be captured and delivered continuously to S3 in near real time, optionally transformed by Lambda on the way, with NO stream infrastructure to manage or capacity to provision. Which service fits?",
    options: [
      { text: "Amazon Data Firehose (formerly Kinesis Data Firehose)", correct: true, why: "Firehose is fully managed, auto-scaling delivery to S3/Redshift/OpenSearch, with built-in Lambda transformation and buffering." },
      { text: "Kinesis Data Streams with a custom consumer on EC2", correct: false, why: "Streams requires shard capacity management and a consumer fleet — exactly the infrastructure the team wants to avoid." },
      { text: "SQS with a Lambda writing batches to S3", correct: false, why: "Feasible, but you'd hand-build batching, buffering, retries, and partitioning that Firehose provides out of the box." },
      { text: "AWS Glue ETL jobs every 10 minutes", correct: false, why: "Scheduled batch ETL is not near-real-time delivery." },
    ],
  },
  {
    topic: "Analytics & Data Pipelines",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "Analysts need to run occasional ad-hoc SQL queries over JSON and Parquet files already stored in S3. Queries run a few times per week. What is the MOST cost-effective solution?",
    options: [
      { text: "Amazon Athena querying the S3 data in place.", correct: true, why: "Athena is serverless and bills per TB scanned — perfect for occasional queries with zero infrastructure." },
      { text: "A persistent Amazon Redshift cluster.", correct: false, why: "A cluster running 24/7 for a few weekly queries is mostly paid idle time." },
      { text: "Load the data into RDS and query there.", correct: false, why: "ETL into a relational database adds cost and effort for data that can be queried where it sits." },
      { text: "An EMR cluster with Spark SQL.", correct: false, why: "EMR is powerful for heavy processing but is oversized, always-on infrastructure for ad-hoc queries." },
    ],
  },
  {
    topic: "Analytics & Data Pipelines",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "Athena query costs are high because every query scans entire CSV data sets in S3. Which change reduces cost the most?",
    options: [
      { text: "Convert the data to a columnar compressed format such as Parquet and partition it.", correct: true, why: "Athena bills per byte scanned; columnar formats plus partitioning can cut data scanned by an order of magnitude." },
      { text: "Increase the Athena query timeout.", correct: false, why: "Timeouts do not affect the volume of data scanned or the bill." },
      { text: "Move the bucket to a cheaper Region.", correct: false, why: "Storage price differences are minor next to per-query scan charges." },
      { text: "Enable S3 Transfer Acceleration on the bucket.", correct: false, why: "That is an upload performance feature and adds cost." },
    ],
  },
  {
    topic: "Analytics & Data Pipelines",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A company needs a petabyte-scale data warehouse for complex analytical SQL joins across historical business data, with BI tool integration. Which service is appropriate?",
    options: [
      { text: "Amazon Redshift", correct: true, why: "Redshift is the managed columnar MPP data warehouse designed for large-scale analytical queries and BI workloads." },
      { text: "Amazon DynamoDB", correct: false, why: "DynamoDB is a key-value store without the join and aggregation capability analytics requires." },
      { text: "Amazon RDS for MySQL", correct: false, why: "A row-oriented OLTP engine struggles with petabyte-scale analytical scans." },
      { text: "Amazon ElastiCache", correct: false, why: "ElastiCache is an in-memory cache, not a warehouse." },
    ],
  },
  {
    topic: "Analytics & Data Pipelines",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "An operations team needs to search and visualize application logs interactively, with dashboards and full-text queries over recent data. Which service is designed for this?",
    options: [
      { text: "Amazon OpenSearch Service", correct: true, why: "OpenSearch provides full-text search, log analytics, and dashboards over ingested log data." },
      { text: "Amazon Athena", correct: false, why: "Athena runs ad-hoc SQL over S3 but is not an interactive log search and dashboard tool." },
      { text: "Amazon Quick (formerly QuickSight) alone", correct: false, why: "Amazon Quick visualizes data from a source; it is not a log search engine itself." },
      { text: "AWS CloudTrail", correct: false, why: "CloudTrail records API activity; it is a log source, not a search platform." },
    ],
  },
  {
    topic: "Analytics & Data Pipelines",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A team must discover the schema of semi-structured files in S3 and build a searchable metadata catalog for Athena, without managing servers. Which service should be used?",
    options: [
      { text: "AWS Glue crawlers and the Glue Data Catalog", correct: true, why: "Glue crawlers infer schemas and populate the serverless Data Catalog that Athena and Redshift Spectrum query against." },
      { text: "Amazon EMR with a persistent Hive metastore", correct: false, why: "That means running and paying for cluster infrastructure Glue provides serverlessly." },
      { text: "Amazon Macie", correct: false, why: "Macie classifies sensitive data; it does not build a query metadata catalog." },
      { text: "AWS Config", correct: false, why: "Config catalogs AWS resource configurations, not data schemas." },
    ],
  },
  {
    topic: "Analytics & Data Pipelines",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A Kinesis Data Streams application is hitting ProvisionedThroughputExceededException errors during traffic peaks. What is the correct remedy?",
    options: [
      { text: "Increase the number of shards (or switch to on-demand capacity mode).", correct: true, why: "Stream throughput scales with shard count; each shard has fixed write/read limits." },
      { text: "Increase the data retention period.", correct: false, why: "Retention controls how long records are stored, not the ingest rate limit." },
      { text: "Add more consumer applications.", correct: false, why: "More consumers add read load, potentially worsening per-shard read limits." },
      { text: "Switch to Amazon Data Firehose without changing anything else.", correct: false, why: "Firehose is a different service with different semantics — it is not a drop-in throughput fix for a Streams consumer app." },
    ],
  },

  // ============================================================
  // Migration & Transfer
  // ============================================================
  {
    topic: "Migration & Transfer",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A company must migrate a 2 TB on-premises Oracle database to Amazon Aurora PostgreSQL with only minutes of downtime. Which combination of tools should be used?",
    options: [
      { text: "AWS Schema Conversion Tool (SCT) to convert the schema, then AWS DMS with ongoing replication for cutover.", correct: true, why: "SCT handles the Oracle→PostgreSQL schema conversion and DMS's CDC replication keeps the target in sync until a near-zero-downtime cutover." },
      { text: "Export to CSV, upload to S3, and import during a weekend outage.", correct: false, why: "A bulk dump/restore of 2 TB means hours of downtime and manual schema conversion." },
      { text: "AWS DataSync to copy the database files to Aurora.", correct: false, why: "DataSync moves files to storage services; Aurora cannot ingest raw Oracle data files." },
      { text: "AWS Application Migration Service (MGN).", correct: false, why: "MGN rehosts entire servers to EC2 — it does not convert Oracle to Aurora PostgreSQL." },
    ],
  },
  {
    topic: "Migration & Transfer",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A company must migrate 500 TB from an on-premises NFS array to Amazon S3 over an existing 10 Gbps Direct Connect link, with scheduling, bandwidth throttling, and automatic integrity verification. Which service should be used?",
    options: [
      { text: "AWS DataSync", correct: true, why: "DataSync is purpose-built for online NFS/SMB-to-AWS transfers with scheduling, throttling, and end-to-end verification." },
      { text: "AWS Snowball Edge", correct: false, why: "Snowball is for when the network is the bottleneck — with 10 Gbps available, shipping devices adds needless delay and handling." },
      { text: "aws s3 cp in a loop from a mounted share", correct: false, why: "CLI scripts give you no scheduling, verification, or incremental-sync management at 500 TB scale." },
      { text: "AWS Transfer Family", correct: false, why: "Transfer Family provides SFTP/FTPS endpoints INTO S3 for partners; it is not a bulk migration engine." },
    ],
  },
  {
    topic: "Migration & Transfer",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A remote research station has 80 TB of data to move to S3 within two weeks, but its internet uplink is only 100 Mbps and cannot be upgraded. What is the most practical transfer method?",
    options: [
      { text: "Order an AWS Snowball Edge device, load the data locally, and ship it back to AWS.", correct: true, why: "80 TB over 100 Mbps would take roughly 2.5 months; a shipped Snowball completes the job within days." },
      { text: "S3 Transfer Acceleration.", correct: false, why: "Acceleration optimizes the route, but a 100 Mbps pipe is still the hard ceiling — months of transfer." },
      { text: "Multipart uploads run in parallel.", correct: false, why: "Parallelism can't exceed the physical uplink bandwidth either." },
      { text: "AWS DataSync with compression.", correct: false, why: "DataSync still rides the same 100 Mbps link; even good compression won't close a 10x time gap." },
    ],
  },
  {
    topic: "Migration & Transfer",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A company wants to lift-and-shift 200 on-premises VMs to EC2 with minimal application changes and continuous replication so cutover downtime is short. Which service is designed for this?",
    options: [
      { text: "AWS Application Migration Service (MGN)", correct: true, why: "MGN continuously replicates source servers into AWS and converts them to run natively on EC2 at cutover." },
      { text: "AWS Database Migration Service (DMS)", correct: false, why: "DMS migrates databases, not whole servers." },
      { text: "AWS DataSync", correct: false, why: "DataSync moves files between storage systems; it does not rehost servers." },
      { text: "VM Import/Export run manually per VM", correct: false, why: "It can import images but lacks continuous replication, so downtime would be long across 200 VMs." },
    ],
  },
  {
    topic: "Migration & Transfer",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "External partners must upload files to the company's S3 bucket using SFTP with their existing SFTP clients, authenticated per partner. What should be used?",
    options: [
      { text: "AWS Transfer Family SFTP endpoint backed by S3", correct: true, why: "Transfer Family provides managed SFTP/FTPS/FTP access directly into S3 with per-user identity and no servers to run." },
      { text: "An EC2 instance running an SFTP daemon syncing to S3", correct: false, why: "That is a self-managed server to patch, scale, and secure — the managed service exists to avoid it." },
      { text: "Presigned S3 URLs emailed to partners", correct: false, why: "Presigned URLs work over HTTPS, not SFTP, and don't fit existing SFTP client workflows." },
      { text: "Making the bucket public for uploads", correct: false, why: "A publicly writable bucket is a severe security risk." },
    ],
  },
  {
    topic: "Migration & Transfer",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "Before migrating, a company needs to inventory on-premises servers and gather CPU, memory, and network utilization data to right-size EC2 instances. Which service helps?",
    options: [
      { text: "AWS Application Discovery Service", correct: true, why: "Discovery Service collects on-premises server inventory and utilization data to plan and right-size a migration." },
      { text: "AWS Compute Optimizer", correct: false, why: "Compute Optimizer analyzes existing AWS resources, not on-premises servers." },
      { text: "AWS Trusted Advisor", correct: false, why: "Trusted Advisor reviews AWS account best practices, not on-premises inventory." },
      { text: "Amazon Inspector", correct: false, why: "Inspector is a vulnerability scanner." },
    ],
  },
  {
    topic: "Migration & Transfer",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "An on-premises backup process must write to durable cloud storage while keeping existing backup software that expects an iSCSI tape library. Which solution fits?",
    options: [
      { text: "AWS Storage Gateway — Tape Gateway (Virtual Tape Library)", correct: true, why: "Tape Gateway presents a virtual tape library over iSCSI and stores the tapes in S3 and Glacier." },
      { text: "Amazon S3 File Gateway", correct: false, why: "File Gateway presents NFS/SMB shares, which the tape-oriented backup software does not expect." },
      { text: "AWS DataSync", correct: false, why: "DataSync is a file transfer service and does not emulate a tape library." },
      { text: "Amazon EBS snapshots", correct: false, why: "EBS snapshots apply to AWS volumes, not to on-premises backup software." },
    ],
  },
  {
    topic: "Migration & Transfer",
    domain: "Design Cost-Optimized Architectures",
    pick: 2,
    question:
      "A company is planning a large migration and wants to reduce both the effort of choosing instance sizes after migration and the ongoing cost of over-provisioned resources. Which TWO AWS tools support this?",
    options: [
      { text: "AWS Compute Optimizer for right-sizing recommendations on running resources.", correct: true, why: "Compute Optimizer analyzes utilization metrics and recommends better-fitting instance types." },
      { text: "AWS Cost Explorer rightsizing recommendations.", correct: true, why: "Cost Explorer surfaces idle and underutilized instances with specific downsizing suggestions and savings estimates." },
      { text: "AWS Shield Advanced.", correct: false, why: "Shield is DDoS protection with no cost or sizing role." },
      { text: "Amazon Macie.", correct: false, why: "Macie classifies sensitive data and has no sizing function." },
    ],
  },

  // ============================================================
  // Cost Management & Governance
  // ============================================================
  {
    topic: "Cost Management & Governance",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A nightly batch job processes images for about 4 hours, is fault-tolerant, and can resume if interrupted. Which EC2 purchasing option minimizes cost?",
    options: [
      { text: "Spot Instances", correct: true, why: "Spot offers up to ~90% discount and is ideal for interruptible, resumable batch work." },
      { text: "On-Demand Instances", correct: false, why: "On-Demand is the flexible but full-price option — no discount for tolerance to interruption." },
      { text: "3-year Reserved Instances", correct: false, why: "Reserving capacity 24/7 for a 4-hour nightly job pays for idle time." },
      { text: "Dedicated Hosts", correct: false, why: "Dedicated Hosts are the most expensive option, meant for licensing/compliance needs." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A company has a steady baseline of compute usage but wants discount flexibility across instance families, sizes, and even Fargate/Lambda. What should they buy?",
    options: [
      { text: "Compute Savings Plans", correct: true, why: "Compute Savings Plans give up to 66% off any instance family, Region, Fargate, or Lambda for a $/hour commitment." },
      { text: "Standard Reserved Instances", correct: false, why: "Standard RIs lock you to an instance family and Region — no flexibility across families or Fargate." },
      { text: "Spot Instances", correct: false, why: "Spot can be reclaimed at any time, unsuitable as the discount plan for steady baseline workloads." },
      { text: "On-Demand Capacity Reservations", correct: false, why: "Capacity Reservations guarantee capacity but carry no discount at all." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "Private-subnet EC2 instances download terabytes from S3 each month through a NAT gateway, driving up costs. What change cuts this cost the most?",
    options: [
      { text: "Add a gateway VPC endpoint for S3 and route S3 traffic through it.", correct: true, why: "Gateway endpoints are free — S3 traffic bypasses the NAT gateway's per-GB processing charges entirely." },
      { text: "Use a bigger NAT gateway.", correct: false, why: "NAT gateway pricing is per GB processed; size doesn't change the bill." },
      { text: "Replace the NAT gateway with a NAT instance.", correct: false, why: "It may trim costs slightly but adds management burden and still routes S3 traffic wastefully." },
      { text: "Compress objects in S3.", correct: false, why: "Helps a bit if data is compressible, but eliminating the NAT path saves the whole charge." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Cost-Optimized Architectures",
    pick: 2,
    question:
      "A finance team wants to be alerted before monthly AWS spend exceeds budget and to analyze which services drive costs. Which TWO tools should they use?",
    options: [
      { text: "AWS Budgets with alert thresholds", correct: true, why: "Budgets sends proactive alerts (including forecasted overruns) before spend crosses defined limits." },
      { text: "AWS Cost Explorer", correct: true, why: "Cost Explorer breaks down historical and forecasted spend by service, account, and tag." },
      { text: "AWS Trusted Advisor security checks", correct: false, why: "Trusted Advisor's security checks flag configuration risks, not budget alerts." },
      { text: "AWS CloudTrail", correct: false, why: "CloudTrail records API calls for auditing; it contains no cost data." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "Developers leave dev/test EC2 instances running around the clock, though they are only used on weekdays 9am–6pm. What is the simplest way to cut this cost?",
    options: [
      { text: "Schedule automatic stop/start (e.g., Instance Scheduler or EventBridge + Lambda).", correct: true, why: "Stopping instances outside working hours cuts their compute cost by roughly 65–70% with no workflow change." },
      { text: "Buy Reserved Instances for the dev environment.", correct: false, why: "RIs discount 24/7 usage — paying less for idle nights is still paying for idle nights." },
      { text: "Migrate all dev work to larger shared instances.", correct: false, why: "Consolidation may help slightly but changes workflows and still runs 24/7." },
      { text: "Switch dev instances to Dedicated Hosts.", correct: false, why: "Dedicated Hosts increase costs — they solve licensing needs, not idle waste." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A company with 30 AWS accounts wants volume pricing tiers applied across all accounts and a single monthly bill. What should be configured?",
    options: [
      { text: "AWS Organizations with consolidated billing.", correct: true, why: "Consolidated billing aggregates usage so all accounts share volume discounts and RI/Savings Plans benefits under one bill." },
      { text: "A separate Savings Plan purchased in each account.", correct: false, why: "Fragmenting commitments per account forfeits the aggregation benefit consolidated billing provides." },
      { text: "Cost allocation tags alone.", correct: false, why: "Tags attribute cost for reporting; they do not merge billing or pool discounts." },
      { text: "One shared IAM user across all accounts.", correct: false, why: "That is a security anti-pattern and unrelated to billing." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "Management asks which team is responsible for each dollar of AWS spend. Resources are spread across many services. What is the standard approach?",
    options: [
      { text: "Apply a consistent tagging strategy and activate cost allocation tags for reporting.", correct: true, why: "Cost allocation tags let Cost Explorer and billing reports break down spend by team, project, or environment." },
      { text: "Create a separate AWS account per engineer.", correct: false, why: "Account sprawl is a heavy-handed substitute for tagging and adds real management overhead." },
      { text: "Review CloudTrail logs monthly.", correct: false, why: "CloudTrail shows who called APIs, not what each team spends." },
      { text: "Enable Trusted Advisor.", correct: false, why: "Trusted Advisor gives optimization checks, not per-team cost attribution." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "An auditor asks for a complete record of who made every configuration change in an AWS account over the last year, including the source IP. What must be in place?",
    options: [
      { text: "AWS CloudTrail with a multi-Region trail delivering logs to S3.", correct: true, why: "CloudTrail records every API call with identity, time, source IP, and parameters — the account's audit log." },
      { text: "Amazon CloudWatch metrics with 1-year retention.", correct: false, why: "Metrics are numeric performance data with no record of who did what." },
      { text: "VPC Flow Logs.", correct: false, why: "Flow Logs capture network traffic metadata, not configuration changes." },
      { text: "AWS Config alone.", correct: false, why: "Config tracks resource state over time but CloudTrail is the service that records the caller identity for every API action." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A compliance policy states that every EBS volume must be encrypted. The team needs continuous detection of non-compliant volumes and automatic remediation. Which service combination is appropriate?",
    options: [
      { text: "AWS Config rules with automatic remediation actions.", correct: true, why: "Config continuously evaluates resources against rules and can trigger SSM Automation documents to remediate." },
      { text: "Amazon Inspector with weekly scans.", correct: false, why: "Inspector finds software vulnerabilities, not resource configuration compliance." },
      { text: "AWS CloudTrail alarms.", correct: false, why: "CloudTrail records the API calls but does not evaluate ongoing resource compliance state." },
      { text: "Trusted Advisor cost checks.", correct: false, why: "Wrong category entirely — those checks target spend, not encryption compliance." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "An operations team needs a single, centrally managed backup policy covering EBS volumes, RDS databases, DynamoDB tables, and EFS file systems, with retention rules and cross-Region copies. What should they use?",
    options: [
      { text: "AWS Backup with backup plans applied via tags.", correct: true, why: "AWS Backup centralizes policy-driven backup, retention, and cross-Region copy across many AWS services." },
      { text: "Per-service scripts triggered by EventBridge.", correct: false, why: "Custom scripts per service duplicate what AWS Backup manages centrally and are harder to audit." },
      { text: "EBS snapshot lifecycle policies only.", correct: false, why: "Data Lifecycle Manager covers EBS snapshots but not RDS, DynamoDB, or EFS." },
      { text: "S3 Cross-Region Replication.", correct: false, why: "CRR replicates S3 objects and does not back up databases or volumes." },
    ],
  },

  // ============================================================
  // 2026 refresh — questions aligned to the SAA-C03 v1.1 exam guide
  // and the one-stop cheatsheet (cheatsheet.html).
  // ============================================================

  // ---------- IAM & Identity ----------
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A company with 200 accounts in AWS Organizations must guarantee that NO principal outside the organization can access any S3 bucket, SQS queue, or KMS key in any account — even if a developer writes an overly permissive resource policy. What is the MOST scalable control?",
    options: [
      { text: "A resource control policy (RCP) at the organization root that denies access unless aws:PrincipalOrgID matches the organization.", correct: true, why: "RCPs cap the permissions on resources org-wide, so a careless bucket or key policy can't grant access to outsiders — a central data perimeter." },
      { text: "A service control policy (SCP) denying s3:*, sqs:*, and kms:* for external accounts.", correct: false, why: "SCPs only restrict principals INSIDE your organization; they can't stop an external principal using a permissive resource policy." },
      { text: "Review every resource policy weekly with a Lambda script.", correct: false, why: "Detective and custom — gaps exist between reviews and it doesn't scale to 200 accounts." },
      { text: "Enable Amazon Macie in every account.", correct: false, why: "Macie finds sensitive data; it does not enforce who can access resources." },
    ],
  },
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A third-party monitoring SaaS needs read-only access to CloudWatch metrics in a customer's AWS account. The vendor serves thousands of customers. What is the MOST secure way to grant access?",
    options: [
      { text: "Create an IAM role trusted by the vendor's AWS account, require a unique external ID in the trust policy, and attach a read-only policy.", correct: true, why: "Cross-account roles give temporary credentials; the external ID prevents the 'confused deputy' problem where another customer tricks the vendor into using your role." },
      { text: "Create an IAM user with access keys and send them to the vendor.", correct: false, why: "Long-lived keys outside your control are the classic anti-pattern." },
      { text: "Share the root user credentials with MFA disabled for automation.", correct: false, why: "Never share root, never disable MFA." },
      { text: "Make the CloudWatch dashboards public.", correct: false, why: "Exposes data to everyone and doesn't give API access to metrics." },
    ],
  },
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A company wants Amazon WorkSpaces and the AWS console to authenticate employees against its existing on-premises Active Directory. It does NOT want any directory data cached or replicated in AWS. Which option fits?",
    options: [
      { text: "AD Connector", correct: true, why: "AD Connector is a proxy that redirects authentication requests to on-prem AD without storing directory data in AWS." },
      { text: "AWS Managed Microsoft AD with a two-way trust", correct: false, why: "Managed AD runs a real directory in AWS — more than required and contradicts 'no directory in AWS'." },
      { text: "Simple AD", correct: false, why: "Simple AD is a standalone Samba directory; it doesn't use the existing on-prem AD." },
      { text: "Amazon Cognito user pool", correct: false, why: "Cognito is for application end users, not workforce AD authentication." },
    ],
  },
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A security team must quickly identify every S3 bucket, KMS key, IAM role, and Lambda function in the organization that is shared with principals outside the organization. Which service provides this with the LEAST effort?",
    options: [
      { text: "IAM Access Analyzer with the organization as the zone of trust.", correct: true, why: "Access Analyzer uses automated reasoning over resource policies to flag external access across the org." },
      { text: "AWS CloudTrail Lake queries.", correct: false, why: "CloudTrail shows API calls that happened, not which policies currently allow external access." },
      { text: "Amazon GuardDuty.", correct: false, why: "GuardDuty detects threats in activity logs; it doesn't analyse policy grants." },
      { text: "AWS Trusted Advisor.", correct: false, why: "Trusted Advisor has a few exposure checks but not comprehensive policy analysis across resource types." },
    ],
  },
  {
    topic: "IAM & Identity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "An ECS service running on Fargate needs to write items to a DynamoDB table. Where should the DynamoDB permissions be granted?",
    options: [
      { text: "The ECS task role referenced in the task definition.", correct: true, why: "The task role supplies credentials to the application containers — scoped to just that task." },
      { text: "The ECS task execution role.", correct: false, why: "The execution role is used by the ECS agent to pull images, write logs, and fetch secrets — not by your application code." },
      { text: "Access keys stored as environment variables in the task definition.", correct: false, why: "Static keys are unnecessary and risky when task roles exist." },
      { text: "A DynamoDB resource-based policy granting the Fargate service principal.", correct: false, why: "Granting a whole service principal is far too broad; app identity comes from the task role." },
    ],
  },

  // ---------- Data Protection & Encryption ----------
  {
    topic: "Data Protection & Encryption",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "An application writes tens of thousands of objects per second to an S3 bucket using SSE-KMS with a customer managed key. Requests are being throttled by KMS and the KMS bill is high. What is the simplest fix that keeps SSE-KMS?",
    options: [
      { text: "Enable S3 Bucket Keys on the bucket.", correct: true, why: "Bucket Keys create a short-lived bucket-level data key, cutting KMS requests by up to ~99% — fixing both throttling and cost." },
      { text: "Switch to SSE-C.", correct: false, why: "That abandons KMS and forces the app to manage and send keys on every request." },
      { text: "Create a new KMS key per object prefix.", correct: false, why: "KMS request quotas are per account per Region; more keys don't raise them meaningfully and add management overhead." },
      { text: "Enable S3 Transfer Acceleration.", correct: false, why: "Acceleration speeds uploads; it doesn't change KMS call volume." },
    ],
  },
  {
    topic: "Data Protection & Encryption",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A global application encrypts data client-side with KMS in us-east-1 and replicates the ciphertext to eu-west-1. During a Regional outage the eu-west-1 stack must decrypt the data without calling us-east-1. What should be used?",
    options: [
      { text: "AWS KMS multi-Region keys, with a replica key in eu-west-1.", correct: true, why: "Multi-Region keys share key material and ID across Regions, so ciphertext from one Region decrypts in the other locally." },
      { text: "Copy the KMS key ARN into the eu-west-1 configuration.", correct: false, why: "A single-Region key can only be used in its own Region — the ARN won't work elsewhere." },
      { text: "Export the KMS key material and store it in Secrets Manager.", correct: false, why: "You can't export key material from KMS-generated keys, and storing keys as secrets breaks the security model." },
      { text: "Use SSE-S3 instead.", correct: false, why: "Doesn't address client-side encryption and gives up key control and auditing." },
    ],
  },
  {
    topic: "Data Protection & Encryption",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A web application on EC2 was found vulnerable to server-side request forgery (SSRF). The team worries an attacker could read the instance role's temporary credentials from instance metadata. What is the most direct mitigation?",
    options: [
      { text: "Require IMDSv2 (session tokens) on the instances.", correct: true, why: "IMDSv2 requires a PUT-obtained session token, which typical SSRF attacks can't obtain, protecting role credentials." },
      { text: "Remove the IAM role and use access keys in a config file.", correct: false, why: "Static keys are easier to steal and never rotate." },
      { text: "Move the instances into a private subnet.", correct: false, why: "SSRF is triggered through the application itself; subnet placement doesn't stop it reaching the metadata endpoint." },
      { text: "Enable GuardDuty.", correct: false, why: "GuardDuty may detect credential misuse afterwards but doesn't prevent the theft." },
    ],
  },
  {
    topic: "Data Protection & Encryption",
    domain: "Design Secure Architectures",
    pick: 2,
    question:
      "A company must protect S3 backups against both accidental deletion and ransomware that compromises an administrator account. Which TWO measures provide the strongest protection?",
    options: [
      { text: "Enable S3 Object Lock in compliance mode with a retention period.", correct: true, why: "Compliance-mode retention can't be shortened or removed by any user, including root — even a compromised admin can't delete." },
      { text: "Use AWS Backup Vault Lock on the backup vault.", correct: true, why: "Vault Lock makes backup recovery points WORM so they can't be deleted before retention expires." },
      { text: "Enable S3 Transfer Acceleration.", correct: false, why: "Performance feature, no protection value." },
      { text: "Use S3 One Zone-IA for the backups.", correct: false, why: "Cheaper, but reduces resilience and adds no deletion protection." },
      { text: "Rely on IAM policies that deny DeleteObject to developers.", correct: false, why: "An administrator can simply change the IAM policy." },
    ],
  },

  // ---------- Network & Edge Security ----------
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 2,
    question:
      "An ALB is used as the origin for a CloudFront distribution that has AWS WAF attached. Attackers are bypassing CloudFront by calling the ALB's DNS name directly. Which TWO actions ensure traffic only arrives via CloudFront?",
    options: [
      { text: "Restrict the ALB security group to the AWS-managed CloudFront origin-facing prefix list.", correct: true, why: "Only CloudFront edge IP ranges can then reach the ALB at the network layer." },
      { text: "Have CloudFront add a secret custom header and add an ALB listener rule that only forwards requests containing it.", correct: true, why: "Blocks requests from other CloudFront distributions or anyone who learns the ALB name." },
      { text: "Enable Shield Standard on the ALB.", correct: false, why: "Shield Standard is always on and handles DDoS, not origin bypass." },
      { text: "Move the WAF web ACL from CloudFront to Route 53.", correct: false, why: "WAF can't be attached to Route 53." },
      { text: "Enable cross-zone load balancing.", correct: false, why: "Unrelated to who can reach the ALB." },
    ],
  },
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "Workloads in 30 VPCs must only be allowed to reach an approved list of internet domain names (for example, *.github.com). All other outbound traffic must be blocked and inspected centrally. What should the architect deploy?",
    options: [
      { text: "AWS Network Firewall in a central inspection VPC attached to a Transit Gateway, with domain allow-list rules.", correct: true, why: "Network Firewall supports stateful domain-based filtering and IPS; centralising it behind TGW covers all VPCs." },
      { text: "Security groups with outbound rules for the domains.", correct: false, why: "Security groups work on IPs/CIDRs and prefix lists, not domain names." },
      { text: "Network ACLs with deny-all and allow rules for the domains.", correct: false, why: "NACLs are IP-based and stateless — they can't match on domain names." },
      { text: "AWS WAF on each NAT gateway.", correct: false, why: "WAF attaches to CloudFront, ALB, API Gateway, etc. — not NAT gateways, and it inspects inbound HTTP." },
    ],
  },
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A company has 60 accounts. The security team must ensure every internet-facing ALB and CloudFront distribution — including ones created in the future — automatically has a standard set of AWS WAF rules. What should be used?",
    options: [
      { text: "AWS Firewall Manager WAF policies scoped to the organization.", correct: true, why: "Firewall Manager centrally applies and enforces WAF (and SG/Shield/Network Firewall) policies across accounts, including new resources." },
      { text: "A CloudFormation template that each team must remember to deploy.", correct: false, why: "Relies on humans; new resources can be missed." },
      { text: "AWS Config rule that emails the team when WAF is missing.", correct: false, why: "Detects but doesn't enforce." },
      { text: "Amazon Inspector.", correct: false, why: "Inspector scans for vulnerabilities; it doesn't manage WAF." },
    ],
  },
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "GuardDuty raised a finding that an EC2 instance communicated with a known command-and-control server. The security team needs to visualise related activity — which IAM roles, IPs, and API calls were involved over the past weeks — to find the root cause. Which service is designed for this?",
    options: [
      { text: "Amazon Detective", correct: true, why: "Detective builds a behaviour graph from CloudTrail, VPC Flow Logs, and GuardDuty findings for investigation." },
      { text: "Amazon Inspector", correct: false, why: "Inspector finds software vulnerabilities, not investigation timelines." },
      { text: "AWS Config", correct: false, why: "Config shows resource configuration history, not activity relationships." },
      { text: "AWS Artifact", correct: false, why: "Artifact provides AWS compliance reports." },
    ],
  },
  {
    topic: "Network & Edge Security",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "Administrators currently SSH into private EC2 instances through a bastion host with port 22 open. Security wants to close all inbound ports, remove the bastion, and log every session centrally. What should they use?",
    options: [
      { text: "AWS Systems Manager Session Manager with session logging to S3/CloudWatch Logs.", correct: true, why: "Session Manager provides shell access through the SSM agent with IAM control, no inbound ports, and full session logging." },
      { text: "EC2 Instance Connect through a public IP on each instance.", correct: false, why: "Needs port 22 reachable and public exposure." },
      { text: "A Site-to-Site VPN for each administrator.", correct: false, why: "Site-to-Site VPN connects networks, not individual admins, and still needs SSH open." },
      { text: "Move the bastion host to a different AZ.", correct: false, why: "Keeps the same design and open port." },
    ],
  },

  // ---------- VPC & Hybrid Connectivity ----------
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "On-premises servers connected via Direct Connect must access Amazon S3 privately, using private IP addresses, without traversing the internet. What should be configured?",
    options: [
      { text: "An S3 interface VPC endpoint (PrivateLink), reached from on-prem over Direct Connect.", correct: true, why: "Interface endpoints have private IPs reachable over DX/VPN; gateway endpoints are only usable from inside the VPC." },
      { text: "An S3 gateway VPC endpoint.", correct: false, why: "Gateway endpoints are route-table targets inside the VPC and can't be used from on-premises or peered networks." },
      { text: "A NAT gateway in the VPC.", correct: false, why: "NAT sends traffic to the internet and doesn't accept on-prem routed traffic for this purpose." },
      { text: "S3 Transfer Acceleration.", correct: false, why: "Uses public edge locations over the internet." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "An architect creates a subnet with a /28 CIDR block. How many IP addresses are available for EC2 instances?",
    options: [
      { text: "11", correct: true, why: "A /28 has 16 addresses and AWS reserves 5 in every subnet (network, router, DNS, future use, broadcast)." },
      { text: "16", correct: false, why: "Ignores the 5 reserved addresses." },
      { text: "14", correct: false, why: "That's traditional networking (minus network and broadcast); AWS reserves 5." },
      { text: "12", correct: false, why: "AWS reserves 5, not 4." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "EC2 instances with IPv6 addresses in a VPC must be able to initiate connections to the internet over IPv6, but must not be reachable from the internet over IPv6. What should be used?",
    options: [
      { text: "An egress-only internet gateway.", correct: true, why: "The egress-only IGW is the stateful outbound-only gateway for IPv6 — the 'NAT for IPv6'." },
      { text: "A NAT gateway.", correct: false, why: "NAT gateways translate IPv4 (and NAT64), not plain IPv6 egress." },
      { text: "An internet gateway with a security group.", correct: false, why: "Works technically but the question asks for the purpose-built outbound-only control; a regular IGW allows inbound if rules permit." },
      { text: "A virtual private gateway.", correct: false, why: "VGWs terminate VPN/DX connections, not internet access." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A bank uses a 10 Gbps Direct Connect connection. Compliance now requires that all traffic between the data center and the VPCs is encrypted in transit, while retaining DX's consistent performance. What is the recommended approach?",
    options: [
      { text: "Run an IPsec Site-to-Site VPN over the Direct Connect connection (or enable MACsec on the dedicated connection).", correct: true, why: "DX is private but not encrypted; VPN over DX or MACsec adds encryption while keeping the dedicated path." },
      { text: "Direct Connect is already encrypted; no change is needed.", correct: false, why: "A common misconception — DX traffic isn't encrypted by default." },
      { text: "Replace Direct Connect with an internet-based VPN only.", correct: false, why: "Loses the consistent bandwidth and latency the bank relies on." },
      { text: "Enable VPC Flow Logs.", correct: false, why: "Flow Logs record metadata; they don't encrypt anything." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A company has one Direct Connect connection in Frankfurt and needs private connectivity from its data center to VPCs in eu-central-1, eu-west-1, and us-east-1. What is the MOST cost-effective design?",
    options: [
      { text: "Use a Direct Connect gateway associated with the VPCs' virtual private gateways (or a Transit Gateway) in each Region.", correct: true, why: "A Direct Connect gateway is global and lets one DX connection reach VPCs in multiple Regions." },
      { text: "Order a new Direct Connect connection in every Region.", correct: false, why: "Works but multiplies cost and lead time unnecessarily." },
      { text: "Peer the eu-central-1 VPC with the others and route through it.", correct: false, why: "VPC peering is non-transitive — on-prem traffic can't hop through a peered VPC." },
      { text: "Use S3 Transfer Acceleration.", correct: false, why: "Irrelevant to private network connectivity." },
    ],
  },
  {
    topic: "VPC & Hybrid Connectivity",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A Site-to-Site VPN to a virtual private gateway is saturating at around 1.25 Gbps. The company needs more aggregate VPN bandwidth before a Direct Connect link is available. What should the architect do?",
    options: [
      { text: "Terminate multiple VPN connections on a Transit Gateway and enable ECMP to spread traffic across tunnels.", correct: true, why: "Each tunnel tops out around 1.25 Gbps; TGW ECMP aggregates bandwidth across many tunnels." },
      { text: "Increase the VGW instance size.", correct: false, why: "VGWs have no instance size to change." },
      { text: "Add a second tunnel to the same VGW connection.", correct: false, why: "VGW connections already have two tunnels, used active/passive for redundancy — not aggregated." },
      { text: "Enable Global Accelerator on the VPC.", correct: false, why: "Accelerated VPN improves path quality, not per-tunnel bandwidth limits." },
    ],
  },

  // ---------- DNS, CDN & Global Traffic ----------
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A company wants its apex domain example.com (no www) to point to an Application Load Balancer. Which Route 53 record should be created?",
    options: [
      { text: "An alias A record targeting the ALB.", correct: true, why: "Alias records work at the zone apex, track the ALB's changing IPs, and queries to AWS targets are free." },
      { text: "A CNAME record targeting the ALB DNS name.", correct: false, why: "DNS forbids CNAMEs at the zone apex." },
      { text: "An A record with the ALB's current IP addresses.", correct: false, why: "ALB IPs change; hard-coded IPs will break." },
      { text: "An MX record.", correct: false, why: "MX records are for mail routing." },
    ],
  },
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A media company's licensing agreements forbid serving its video catalogue to viewers in three specific countries. Content is delivered through CloudFront. What is the simplest way to enforce this?",
    options: [
      { text: "Enable CloudFront geographic restrictions (deny list) for those countries.", correct: true, why: "CloudFront geo restriction blocks requests at the edge based on viewer country with no code." },
      { text: "Use Route 53 latency-based routing.", correct: false, why: "Latency routing chooses Regions for speed; it doesn't block countries." },
      { text: "Add NACL rules for every IP range in those countries.", correct: false, why: "Unmaintainable, and NACLs don't apply at CloudFront edges." },
      { text: "Use S3 bucket policies with aws:SourceIp.", correct: false, why: "With CloudFront in front, S3 sees CloudFront, not the viewer." },
    ],
  },
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A team in eu-west-1 requested an ACM public certificate in eu-west-1 for their custom domain, but it does not appear when they try to attach it to their CloudFront distribution. What is the fix?",
    options: [
      { text: "Request (or import) the certificate in us-east-1 (N. Virginia).", correct: true, why: "CloudFront only uses ACM certificates from us-east-1, regardless of where the origin lives." },
      { text: "Export the certificate from ACM and upload it to the origin server.", correct: false, why: "Doesn't make it available to CloudFront." },
      { text: "Wait 24 hours for the certificate to propagate globally.", correct: false, why: "ACM certificates don't propagate between Regions." },
      { text: "Use an EV certificate instead.", correct: false, why: "Certificate type is not the problem; Region is." },
    ],
  },
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A Route 53 failover policy must check the health of an application running on EC2 instances in private subnets with no public endpoint. How can Route 53 determine health?",
    options: [
      { text: "Create a CloudWatch alarm on an application metric and associate a Route 53 health check with that alarm.", correct: true, why: "Route 53 health checkers live on the internet; for private resources you base the health check on a CloudWatch alarm." },
      { text: "Point the health check at the instances' private IP addresses.", correct: false, why: "Route 53 health checkers can't reach private IPs." },
      { text: "Route 53 cannot do failover for private resources.", correct: false, why: "It can — via CloudWatch alarm-based health checks." },
      { text: "Use multivalue answer routing without health checks.", correct: false, why: "Without health checks Route 53 can't detect failure at all." },
    ],
  },
  {
    topic: "DNS, CDN & Global Traffic",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A CloudFront distribution serves static assets from an S3 bucket in us-east-1. The company wants CloudFront to automatically serve from a replica bucket in us-west-2 if the primary origin returns errors. What should be configured?",
    options: [
      { text: "A CloudFront origin group with the primary and secondary S3 origins and failover status codes.", correct: true, why: "Origin groups give automatic origin failover per request on configured error codes." },
      { text: "Route 53 failover records for the two bucket endpoints.", correct: false, why: "CloudFront connects to its configured origin; DNS failover on bucket names isn't how CloudFront origin failover works." },
      { text: "Two separate distributions with weighted routing.", correct: false, why: "More complex and doesn't fail over on origin errors." },
      { text: "Enable S3 Transfer Acceleration on both buckets.", correct: false, why: "Upload performance feature, not failover." },
    ],
  },

  // ---------- Compute, Containers & Scaling ----------
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "Each uploaded video triggers a transcoding job that takes 30–60 minutes and needs 8 GB of memory. The team wants a serverless, event-driven solution with the LEAST operational overhead. What should they use?",
    options: [
      { text: "S3 event → EventBridge rule (or Step Functions) → run an ECS task on Fargate.", correct: true, why: "Fargate tasks have no time limit and need no servers, triggered directly by events." },
      { text: "S3 event → Lambda function with 10 GB memory.", correct: false, why: "Lambda has a hard 15-minute maximum run time." },
      { text: "An EC2 instance polling the bucket every minute.", correct: false, why: "Always-on server and polling = overhead and idle cost." },
      { text: "API Gateway → Lambda with an extended timeout.", correct: false, why: "API Gateway integration timeout (29 s by default) and Lambda's 15 minutes both fall short." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design High-Performing Architectures",
    pick: 2,
    question:
      "An e-commerce site sees a predictable traffic surge every weekday at 9:00. New instances take 10 minutes to boot and warm their caches, so users see errors at the start of the surge. Which TWO changes address this?",
    options: [
      { text: "Use scheduled scaling (or predictive scaling) to add capacity before 9:00.", correct: true, why: "Known, recurring peaks are exactly what scheduled/predictive scaling is for — capacity is ready in advance." },
      { text: "Add a warm pool of pre-initialized instances to the Auto Scaling group.", correct: true, why: "Warm pools keep stopped, pre-initialised instances ready, cutting scale-out time sharply." },
      { text: "Switch to simple scaling with a longer cooldown.", correct: false, why: "Makes the reaction even slower." },
      { text: "Use a larger Classic Load Balancer.", correct: false, why: "Load balancers aren't sized like that, and the bottleneck is instance boot time." },
      { text: "Disable ELB health checks so instances join faster.", correct: false, why: "Sends traffic to instances that aren't ready — more errors." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "An application behind an Application Load Balancer must log each client's original IP address, but the web server logs only show the ALB's private IPs. What should the developers do with the LEAST change?",
    options: [
      { text: "Read the X-Forwarded-For header in the application or web server log format.", correct: true, why: "ALB terminates connections and passes the client IP in X-Forwarded-For." },
      { text: "Replace the ALB with a Classic Load Balancer.", correct: false, why: "Same proxy behaviour and a legacy product." },
      { text: "Enable VPC Flow Logs on the instances.", correct: false, why: "Flow Logs would still show the ALB as the source of connections to the instances." },
      { text: "Assign Elastic IPs to every instance.", correct: false, why: "Doesn't change what the ALB sends." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A Java-based Lambda function has multi-second cold starts that hurt an interactive API. The team wants to reduce cold-start latency at the LOWEST cost without keeping environments running all the time. What should they enable?",
    options: [
      { text: "Lambda SnapStart on published function versions.", correct: true, why: "SnapStart restores from a cached, pre-initialised snapshot, sharply cutting Java cold starts without paying for always-warm capacity." },
      { text: "Provisioned concurrency sized for peak traffic.", correct: false, why: "Effective, but you pay for pre-warmed environments around the clock — not the lowest-cost option." },
      { text: "Increase the function timeout to 15 minutes.", correct: false, why: "Timeout doesn't affect startup latency." },
      { text: "Move the function into a VPC.", correct: false, why: "Adds networking setup, doesn't help cold starts." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A company runs three critical EC2 instances for a small quorum-based cluster. The instances must never share underlying hardware, so a single rack failure can't take down more than one. Which placement strategy fits?",
    options: [
      { text: "Spread placement group", correct: true, why: "Spread groups place each instance on distinct hardware (max 7 per AZ per group) — ideal for a few critical nodes." },
      { text: "Cluster placement group", correct: false, why: "Packs instances close together — maximising correlated failure risk." },
      { text: "Partition placement group", correct: false, why: "Designed for large distributed systems with many instances per partition; spread is the direct fit for a handful of nodes." },
      { text: "Dedicated Hosts", correct: false, why: "Puts instances on hardware dedicated to you, which can mean the SAME host — the opposite goal." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "An application on EC2 takes 20 minutes to load a large in-memory dataset after start. The instances are only needed during business hours. The team wants instances to resume quickly in the morning with memory intact while not paying for compute overnight. What should they use?",
    options: [
      { text: "EC2 hibernation", correct: true, why: "Hibernate saves RAM to the encrypted EBS root volume and restores it on start, skipping the warm-up; no compute charge while hibernated." },
      { text: "Stop and start the instances normally.", correct: false, why: "A normal stop loses memory, so the 20-minute warm-up repeats." },
      { text: "Use instance store volumes for the dataset.", correct: false, why: "Instance store data is lost on stop." },
      { text: "Keep instances running and buy Reserved Instances.", correct: false, why: "Pays for overnight compute the team wants to avoid." },
    ],
  },
  {
    topic: "Compute, Containers & Scaling",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "An order-processing fleet of EC2 instances consumes from an SQS queue. During sales, the queue backlog grows for 30 minutes before CPU-based scaling reacts. What is the recommended scaling approach?",
    options: [
      { text: "Target tracking on a custom metric: SQS ApproximateNumberOfMessagesVisible divided by the number of in-service instances (backlog per instance).", correct: true, why: "Scaling on backlog per instance reacts to the real work queued and keeps processing latency steady." },
      { text: "Scheduled scaling at midnight.", correct: false, why: "Sales spikes aren't tied to a fixed clock." },
      { text: "Increase the SQS visibility timeout.", correct: false, why: "Affects redelivery, not capacity." },
      { text: "Scale on the NetworkIn metric.", correct: false, why: "Network traffic is a poor proxy for queue work." },
    ],
  },

  // ---------- Storage ----------
  {
    topic: "Storage",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A company enabled S3 Cross-Region Replication on a bucket that already holds 400 million objects. New objects replicate, but the existing objects do not. What is the simplest way to replicate the existing objects?",
    options: [
      { text: "Use S3 Batch Replication.", correct: true, why: "Batch Replication replicates existing objects (and failed replications) using the same replication rules." },
      { text: "Disable and re-enable versioning.", correct: false, why: "Versioning can only be suspended, and that wouldn't trigger replication." },
      { text: "Run aws s3 sync from an EC2 instance.", correct: false, why: "Possible but self-managed, slow at this scale, and loses metadata/version fidelity." },
      { text: "Enable Transfer Acceleration.", correct: false, why: "Upload speed feature; doesn't replicate." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "Dozens of applications and teams share one large S3 data lake bucket. The bucket policy has grown huge and hard to manage, with each team needing different prefixes and some access restricted to specific VPCs. What should the architect use?",
    options: [
      { text: "S3 Access Points — one per application/team, each with its own policy (and VPC-only where required).", correct: true, why: "Access points split one giant bucket policy into manageable, per-use-case policies and network controls." },
      { text: "Create one IAM user per team with inline policies.", correct: false, why: "Moves complexity around and uses long-lived credentials." },
      { text: "Use S3 ACLs per object.", correct: false, why: "ACLs are legacy and disabled by default; unmanageable at scale." },
      { text: "Copy the data into a separate bucket per team nightly.", correct: false, why: "Duplicates storage cost and creates stale copies." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A mobile app lets users upload photos up to 50 MB. Uploads currently pass through API Gateway and Lambda to S3 and fail for large files. What is the MOST scalable fix?",
    options: [
      { text: "Have the backend return an S3 pre-signed URL and let the client upload directly to S3.", correct: true, why: "Clients upload straight to S3 with time-limited permission; no payload limits from API Gateway/Lambda and no compute in the data path." },
      { text: "Increase the Lambda memory to 10 GB.", correct: false, why: "API Gateway's payload limit (10 MB) is still hit before Lambda." },
      { text: "Put CloudFront in front of API Gateway.", correct: false, why: "Doesn't remove the payload limits in the path." },
      { text: "Make the bucket publicly writable.", correct: false, why: "A severe security risk." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "An EBS volume attached to an instance in us-east-1a must be moved to an instance in us-east-1b. What is the correct procedure?",
    options: [
      { text: "Create a snapshot of the volume and create a new volume from it in us-east-1b.", correct: true, why: "EBS volumes are bound to an AZ; snapshots are Regional and can be restored in any AZ." },
      { text: "Detach the volume and attach it to the instance in us-east-1b.", correct: false, why: "EBS volumes can only attach to instances in the same AZ." },
      { text: "Enable EBS Multi-Attach across AZs.", correct: false, why: "Multi-Attach only works within a single AZ." },
      { text: "Change the volume's AZ in the console.", correct: false, why: "No such option exists." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "An EFS file system stores 50 TB of project files. Most files are not accessed after 30 days, but occasionally an old file is needed with normal file system access. How can storage cost be reduced with the LEAST effort?",
    options: [
      { text: "Enable EFS lifecycle management to move files to EFS Infrequent Access (and later Archive) after 30 days of no access.", correct: true, why: "Lifecycle policies tier cold files automatically while keeping them in the same file system path." },
      { text: "Copy old files to S3 Glacier Deep Archive with a script and delete them from EFS.", correct: false, why: "Breaks file-system access and hours-long retrieval doesn't fit occasional needs; also custom scripting." },
      { text: "Switch to EBS gp3 volumes.", correct: false, why: "EBS isn't shared across instances like EFS and would require re-architecture." },
      { text: "Enable Provisioned Throughput mode.", correct: false, why: "Throughput mode affects performance cost, not storage cost." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A company is migrating a NetApp storage array that serves the same data to Linux clients over NFS and to Windows clients over SMB, and also uses NetApp SnapMirror. Which AWS service is the best fit with minimal changes?",
    options: [
      { text: "Amazon FSx for NetApp ONTAP", correct: true, why: "ONTAP supports NFS, SMB, and iSCSI on the same data, plus NetApp features like SnapMirror and snapshots." },
      { text: "Amazon EFS", correct: false, why: "NFS only — no SMB for Windows clients." },
      { text: "Amazon FSx for Windows File Server", correct: false, why: "SMB-focused; no native multi-protocol NetApp feature set." },
      { text: "Amazon FSx for Lustre", correct: false, why: "HPC file system, not a general multi-protocol NAS replacement." },
    ],
  },
  {
    topic: "Storage",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A company hosts a static website from an S3 bucket using the S3 website endpoint. It now needs HTTPS with a custom domain and lower latency for global visitors. What should be done?",
    options: [
      { text: "Put a CloudFront distribution in front of the bucket with an ACM certificate (us-east-1) for the custom domain.", correct: true, why: "S3 website endpoints are HTTP-only; CloudFront adds HTTPS, custom-domain TLS, and edge caching." },
      { text: "Enable HTTPS on the S3 website endpoint.", correct: false, why: "S3 website endpoints don't support HTTPS." },
      { text: "Upload a certificate to the S3 bucket.", correct: false, why: "S3 has no place to attach a TLS certificate." },
      { text: "Move the website to an EC2 instance with nginx.", correct: false, why: "Adds servers to manage and doesn't solve global latency." },
    ],
  },

  // ---------- Databases ----------
  {
    topic: "Databases",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A serverless API built on Lambda connects to an RDS PostgreSQL database. During traffic spikes, the database hits its maximum connections and errors spike, even though CPU is low. What should the architect add with MINIMAL code change?",
    options: [
      { text: "Amazon RDS Proxy between Lambda and the database.", correct: true, why: "RDS Proxy pools and reuses connections, absorbing Lambda connection storms; it also speeds failover and supports IAM auth." },
      { text: "A larger RDS instance class.", correct: false, why: "Raises connection limits somewhat at higher cost but doesn't fix the connection-per-invocation pattern." },
      { text: "Read replicas.", correct: false, why: "Replicas help read throughput, not connection exhaustion on the writer." },
      { text: "Increase Lambda reserved concurrency.", correct: false, why: "More concurrency means MORE connections — worse." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "QA engineers need a full copy of a 10 TB Aurora PostgreSQL production database for testing several times a week. Copies must be created in minutes and storage costs kept low. What should be used?",
    options: [
      { text: "Aurora database cloning.", correct: true, why: "Clones use copy-on-write, so they're created quickly and only changed pages consume extra storage." },
      { text: "Restore from the latest snapshot each time.", correct: false, why: "Slower and each restore pays for a full copy of storage." },
      { text: "Create an Aurora Replica and let QA write to it.", correct: false, why: "Replicas are read-only and part of production." },
      { text: "Use AWS DMS to copy the data each time.", correct: false, why: "Slow for 10 TB and adds a replication instance to manage." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A DynamoDB table uses OrderId as its partition key. A new feature must efficiently query all orders by CustomerEmail. The table already exists in production. What should be added?",
    options: [
      { text: "A global secondary index (GSI) with CustomerEmail as the partition key.", correct: true, why: "GSIs can be added at any time and allow queries on a different partition key." },
      { text: "A local secondary index (LSI) on CustomerEmail.", correct: false, why: "LSIs can only be created at table creation and must share the table's partition key." },
      { text: "Run a Scan with a filter expression.", correct: false, why: "Scans read the whole table — slow and expensive." },
      { text: "Enable DynamoDB Streams.", correct: false, why: "Streams capture changes; they don't provide query access paths." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "Whenever an item in a DynamoDB orders table is created or updated, a downstream process must update a search index and send a notification, in near real time and with no polling. What is the recommended design?",
    options: [
      { text: "Enable DynamoDB Streams and attach a Lambda function as an event source.", correct: true, why: "Streams capture item-level changes in order, and Lambda processes them automatically." },
      { text: "A scheduled Lambda that scans the table every minute.", correct: false, why: "Polling and scans waste capacity and add latency." },
      { text: "Enable DynamoDB TTL.", correct: false, why: "TTL deletes expired items; it doesn't react to writes." },
      { text: "Use DAX.", correct: false, why: "DAX caches reads; it doesn't emit change events." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "An RDS for PostgreSQL workload needs automatic failover in roughly 35 seconds or less and wants the standby capacity to also serve read traffic. Which deployment option fits?",
    options: [
      { text: "RDS Multi-AZ DB cluster (one writer and two readable standbys).", correct: true, why: "Multi-AZ DB clusters use two readable standbys in different AZs with faster failover than Multi-AZ instance deployments." },
      { text: "RDS Multi-AZ DB instance deployment.", correct: false, why: "The single standby isn't readable and failover typically takes 1–2 minutes." },
      { text: "A single-AZ instance with cross-Region read replicas.", correct: false, why: "Replica promotion is manual — no automatic failover." },
      { text: "Daily snapshots copied to another AZ.", correct: false, why: "Restore is manual and slow." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A DynamoDB table storing IoT readings uses DeviceType (only 5 distinct values) as its partition key. Writes are throttled even though the table's total provisioned capacity is far above actual usage. What is the root cause and fix?",
    options: [
      { text: "A hot partition — redesign the key to a high-cardinality value (e.g., DeviceId, or add a random/calculated suffix for write sharding).", correct: true, why: "Low-cardinality keys concentrate traffic on a few partitions; spreading keys distributes load evenly." },
      { text: "Increase provisioned WCUs further.", correct: false, why: "Capacity is spread across partitions; hot keys still hit per-partition limits." },
      { text: "Add DAX.", correct: false, why: "DAX caches reads; it doesn't help write throttling." },
      { text: "Enable global tables.", correct: false, why: "Replicates the same hot-key problem to more Regions." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A gaming company needs a real-time global leaderboard that updates scores thousands of times per second and returns the top 100 players with sub-millisecond latency. Which service is the best fit?",
    options: [
      { text: "Amazon ElastiCache (Valkey/Redis OSS) using sorted sets.", correct: true, why: "Sorted sets maintain ranked scores in memory, making top-N queries trivial and very fast." },
      { text: "Amazon RDS MySQL with an ORDER BY query.", correct: false, why: "Repeated sorting under heavy writes won't meet sub-millisecond latency." },
      { text: "Amazon Redshift.", correct: false, why: "Analytics warehouse, not a real-time serving store." },
      { text: "Amazon S3 with Athena.", correct: false, why: "Batch query, seconds of latency." },
    ],
  },
  {
    topic: "Databases",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "Analysts need near real-time analytics in Amazon Redshift on transactional data from an Aurora MySQL database. The team wants to avoid building and maintaining ETL pipelines. What should they use?",
    options: [
      { text: "Aurora zero-ETL integration with Amazon Redshift.", correct: true, why: "Zero-ETL replicates Aurora data into Redshift continuously within seconds, with no pipeline to manage." },
      { text: "A nightly mysqldump to S3 and COPY into Redshift.", correct: false, why: "Not near real-time and requires custom jobs." },
      { text: "Run analytics queries directly on the Aurora writer.", correct: false, why: "Heavy analytics would hurt OLTP performance." },
      { text: "AWS Glue crawlers on the Aurora database every hour.", correct: false, why: "Crawlers discover schemas; they don't replicate data." },
    ],
  },

  // ---------- Decoupling & Integration ----------
  {
    topic: "Decoupling & Integration",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "An application must send messages through SQS, but some payloads are 20 MB, which exceeds the SQS message size limit. What is the recommended pattern?",
    options: [
      { text: "Store the payload in S3 and send a message containing the object reference (e.g., using the SQS Extended Client Library).", correct: true, why: "The claim-check pattern keeps large payloads in S3 while SQS carries a small pointer." },
      { text: "Split the payload into many messages and reassemble with a standard queue.", correct: false, why: "Standard queues don't guarantee order; reassembly is fragile." },
      { text: "Switch to SNS.", correct: false, why: "SNS has similar payload limits." },
      { text: "Compress the payload with gzip.", correct: false, why: "May not fit reliably; not a general solution." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "An IoT backend must run a short, multi-step workflow (validate, enrich, store) for 100,000 events per second. Each run completes in under 2 seconds, and at-least-once processing is acceptable. Which orchestration option is MOST cost-effective?",
    options: [
      { text: "AWS Step Functions Express Workflows.", correct: true, why: "Express workflows are built for high-volume, short-duration (up to 5 minutes) runs, priced by requests and duration." },
      { text: "AWS Step Functions Standard Workflows.", correct: false, why: "Standard is priced per state transition and suited to long-running, exactly-once workflows — expensive at this volume." },
      { text: "Amazon MQ.", correct: false, why: "A message broker, not a workflow orchestrator." },
      { text: "An EC2 fleet running a custom workflow engine.", correct: false, why: "High operational overhead." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A company is migrating an on-premises application that uses Apache ActiveMQ with JMS and the OpenWire protocol. It wants a managed broker on AWS with the fewest code changes. What should be used?",
    options: [
      { text: "Amazon MQ for ActiveMQ.", correct: true, why: "Amazon MQ runs managed ActiveMQ/RabbitMQ with the same protocols and APIs, so the app connects unchanged." },
      { text: "Amazon SQS.", correct: false, why: "SQS uses its own API; switching from JMS/OpenWire means code changes." },
      { text: "Amazon Kinesis Data Streams.", correct: false, why: "A streaming service with a different model and API." },
      { text: "Amazon SNS.", correct: false, why: "Pub/sub notifications with a different API." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A single EC2 instance runs 40 cron jobs that call internal APIs. If the instance fails, all scheduled jobs stop. The team wants a highly available, serverless replacement with the LEAST operational overhead. What should they use?",
    options: [
      { text: "Amazon EventBridge Scheduler invoking Lambda functions (or other targets) on cron/rate schedules.", correct: true, why: "EventBridge Scheduler is serverless, highly available, supports millions of schedules, and has retries/DLQs." },
      { text: "Two EC2 instances running the same crontab.", correct: false, why: "Duplicate runs and still servers to manage." },
      { text: "An Auto Scaling group of size 1 with the cron instance.", correct: false, why: "Self-heals, but still a server, with gaps during replacement." },
      { text: "SQS delay queues.", correct: false, why: "Maximum delay is 15 minutes; not a scheduler." },
    ],
  },
  {
    topic: "Decoupling & Integration",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "An SNS topic publishes all order events. The shipping service's SQS queue receives every event but only needs events where orderType is 'physical'. The team wants to cut wasted processing with no code changes in the publisher. What should they configure?",
    options: [
      { text: "An SNS subscription filter policy on the shipping queue's subscription.", correct: true, why: "Filter policies deliver only matching messages to each subscriber, at no code change to the publisher." },
      { text: "A Lambda function between SNS and SQS that drops unwanted messages.", correct: false, why: "Extra component to build and run." },
      { text: "Create a separate SNS topic per order type and change the publisher.", correct: false, why: "Requires publisher changes." },
      { text: "Use SQS long polling.", correct: false, why: "Reduces empty receives; doesn't filter content." },
    ],
  },

  // ---------- Analytics & Data Pipelines ----------
  {
    topic: "Analytics & Data Pipelines",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A data lake in S3 is queried with Athena by several teams. The HR team may see all columns of the employees table, while other teams must not see the salary column or rows for executives. What is the simplest way to enforce this?",
    options: [
      { text: "AWS Lake Formation fine-grained (column-, row-, and cell-level) permissions on the Data Catalog tables.", correct: true, why: "Lake Formation centrally enforces column/row/cell security for Athena, Redshift Spectrum, EMR, and Glue." },
      { text: "S3 bucket policies per prefix.", correct: false, why: "S3 permissions work on objects, not columns or rows inside files." },
      { text: "Create separate copies of the dataset for each team.", correct: false, why: "Duplicates data and creates sync and governance issues." },
      { text: "IAM policies on Athena workgroups only.", correct: false, why: "Workgroups control query settings and cost; they don't do column-level data security." },
    ],
  },
  {
    topic: "Analytics & Data Pipelines",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A ride-sharing company needs to calculate the average trip demand per city over sliding 5-minute windows from a Kinesis data stream, and raise alerts on anomalies in real time. Which service is designed for this?",
    options: [
      { text: "Amazon Managed Service for Apache Flink.", correct: true, why: "Flink performs stateful, windowed stream analytics in real time on Kinesis/MSK data." },
      { text: "Amazon Athena.", correct: false, why: "Athena queries data at rest in S3, not live streams." },
      { text: "AWS Glue crawlers.", correct: false, why: "Crawlers discover schemas; they don't compute streaming aggregates." },
      { text: "Amazon Redshift with nightly loads.", correct: false, why: "Nightly loads aren't real time." },
    ],
  },
  {
    topic: "Analytics & Data Pipelines",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A company runs a self-managed Apache Kafka cluster on EC2 and wants to reduce operational burden while keeping existing Kafka producers, consumers, and tooling unchanged. What should they migrate to?",
    options: [
      { text: "Amazon MSK (Managed Streaming for Apache Kafka).", correct: true, why: "MSK runs Apache Kafka as a managed service, so Kafka clients and tools work unchanged." },
      { text: "Amazon Kinesis Data Streams.", correct: false, why: "Different API — all producers and consumers would need rewriting." },
      { text: "Amazon SQS FIFO.", correct: false, why: "A queue, not a Kafka-compatible log." },
      { text: "Amazon MQ.", correct: false, why: "Supports ActiveMQ/RabbitMQ, not Kafka." },
    ],
  },
  {
    topic: "Analytics & Data Pipelines",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "Application logs in JSON are streamed through Amazon Data Firehose to S3 and queried with Athena. Athena costs are rising. What change reduces cost with the LEAST effort?",
    options: [
      { text: "Enable Firehose record format conversion to Apache Parquet and partition the S3 output (e.g., by date).", correct: true, why: "Firehose can convert JSON to columnar Parquet in flight; with partitioning, Athena scans far less data." },
      { text: "Replace Firehose with Kinesis Data Streams.", correct: false, why: "Adds shard management and doesn't change the file format." },
      { text: "Move the S3 data to Glacier Deep Archive.", correct: false, why: "Athena can't query Deep Archive objects without restoring them." },
      { text: "Increase the Firehose buffer size only.", correct: false, why: "Larger files help somewhat but JSON still forces full scans." },
    ],
  },
  {
    topic: "Analytics & Data Pipelines",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "Business users want interactive dashboards with row-level security over data in Redshift and Athena, without managing any BI servers. Which service should be used?",
    options: [
      { text: "Amazon Quick (formerly Amazon QuickSight).", correct: true, why: "AWS's serverless BI service with dashboards, row-level security, and native Redshift/Athena connectors." },
      { text: "Amazon OpenSearch Service.", correct: false, why: "Designed for search and log analytics, not business BI on warehouses." },
      { text: "AWS Glue DataBrew.", correct: false, why: "Data preparation, not dashboards." },
      { text: "Self-hosted Tableau on EC2.", correct: false, why: "Works, but means servers to manage." },
    ],
  },

  // ---------- Migration & Transfer (incl. DR) ----------
  {
    topic: "Migration & Transfer",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "An internal reporting application can tolerate up to 24 hours of data loss and 24 hours of downtime in a Regional disaster. Leadership wants the LOWEST-cost DR strategy. Which should be chosen?",
    options: [
      { text: "Backup and restore — cross-Region backups with infrastructure as code to rebuild.", correct: true, why: "Generous RPO/RTO (hours) fit the cheapest strategy: nothing runs in the DR Region but backups." },
      { text: "Pilot light.", correct: false, why: "Keeps core data replicated continuously — more cost than this RPO/RTO requires." },
      { text: "Warm standby.", correct: false, why: "Runs a scaled-down full stack all the time — overkill." },
      { text: "Multi-site active/active.", correct: false, why: "Most expensive; for near-zero RPO/RTO." },
    ],
  },
  {
    topic: "Migration & Transfer",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A company's critical application requires RPO of seconds and RTO under 15 minutes in another Region. It must remain cost-conscious: a reduced-capacity but fully functional copy is acceptable until scaled up. Which DR strategy fits?",
    options: [
      { text: "Warm standby.", correct: true, why: "A smaller but fully working stack runs continuously with live data replication; you scale it up and switch DNS within minutes." },
      { text: "Backup and restore.", correct: false, why: "RPO/RTO of hours — misses both targets." },
      { text: "Pilot light.", correct: false, why: "App servers are off or not yet created, so RTO is usually tens of minutes or more." },
      { text: "Multi-site active/active.", correct: false, why: "Meets the targets but at full double capacity — not cost-conscious." },
    ],
  },
  {
    topic: "Migration & Transfer",
    domain: "Design Resilient Architectures",
    pick: 1,
    question:
      "A company wants disaster recovery for 50 on-premises physical and virtual servers into AWS with an RPO of seconds, while paying only for minimal staging resources until a failover is needed. Which service fits?",
    options: [
      { text: "AWS Elastic Disaster Recovery (DRS).", correct: true, why: "DRS continuously replicates block-level data to a low-cost staging area and launches recovery instances in minutes when needed." },
      { text: "AWS Backup with daily backups.", correct: false, why: "Daily backups mean an RPO of up to 24 hours." },
      { text: "AWS DataSync scheduled hourly.", correct: false, why: "File transfer, not server recovery, and hourly RPO." },
      { text: "AWS Snowball Edge shipped weekly.", correct: false, why: "Offline transfer with an RPO of days." },
    ],
  },
  {
    topic: "Migration & Transfer",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "A company runs hundreds of VMware vSphere VMs on premises and must exit its data center within 3 months. It wants to keep using vSphere tools and skills without converting VMs. Which option fits?",
    options: [
      { text: "VMware Cloud on AWS (relocate).", correct: true, why: "Runs the vSphere stack on AWS bare metal so VMs move without conversion — the 'relocate' strategy." },
      { text: "Refactor every application to Lambda.", correct: false, why: "Impossible in 3 months for hundreds of VMs." },
      { text: "AWS DMS.", correct: false, why: "Migrates databases, not VMs." },
      { text: "AWS Snowball Edge to S3, then rebuild manually.", correct: false, why: "Slow, manual rebuilds — the opposite of keeping vSphere tooling." },
    ],
  },

  // ---------- Cost Management & Governance ----------
  {
    topic: "Cost Management & Governance",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A company has 2,000 gp2 EBS volumes. Performance requirements are modest (under 3,000 IOPS for most volumes). What is the simplest way to reduce EBS cost without downtime?",
    options: [
      { text: "Modify the volumes from gp2 to gp3 using Elastic Volumes.", correct: true, why: "gp3 is ~20% cheaper per GB with 3,000 IOPS baseline included, and conversion happens live." },
      { text: "Convert all volumes to io2.", correct: false, why: "io2 is more expensive." },
      { text: "Convert boot volumes to sc1.", correct: false, why: "HDD volumes can't be boot volumes and perform poorly." },
      { text: "Snapshot and delete all volumes nightly.", correct: false, why: "Disrupts workloads." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A sandbox account must automatically stop development EC2 instances and block new launches when its monthly forecasted spend exceeds $2,000. Which solution requires the LEAST custom code?",
    options: [
      { text: "AWS Budgets with a budget action that applies a restrictive IAM policy/SCP and stops the EC2 instances.", correct: true, why: "Budget actions can automatically apply policies and stop EC2/RDS instances when thresholds (actual or forecast) are crossed." },
      { text: "Cost Explorer reports reviewed weekly.", correct: false, why: "Manual and reactive." },
      { text: "A custom Lambda that parses the Cost and Usage Report hourly.", correct: false, why: "Custom code where a managed feature exists." },
      { text: "Trusted Advisor cost checks.", correct: false, why: "Recommendations only; no enforcement." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A finance team wants to be notified automatically about unusual spend spikes (for example, an accidentally launched GPU fleet) without having to define fixed thresholds for every service. What should they enable?",
    options: [
      { text: "AWS Cost Anomaly Detection with alert subscriptions.", correct: true, why: "Uses machine learning to learn normal spend patterns and alerts on anomalies — no thresholds to maintain." },
      { text: "AWS Budgets with a fixed threshold per service.", correct: false, why: "Requires defining and maintaining thresholds — the thing they want to avoid." },
      { text: "CloudTrail Insights.", correct: false, why: "Detects unusual API activity, not spend." },
      { text: "Amazon GuardDuty.", correct: false, why: "Security threat detection, not billing anomalies." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A fleet of x86 m5 instances runs a containerized Java service that is compatible with ARM. The team wants better price-performance with minimal effort. What should they do?",
    options: [
      { text: "Move to AWS Graviton-based instances (e.g., m7g) using multi-architecture container images.", correct: true, why: "Graviton offers significantly better price-performance than comparable x86 instances for compatible workloads." },
      { text: "Move to Dedicated Hosts.", correct: false, why: "More expensive; for licensing/compliance." },
      { text: "Double the instance size.", correct: false, why: "Increases cost." },
      { text: "Move the service to instance store-backed instances.", correct: false, why: "Storage choice doesn't improve compute price-performance." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A startup is expanding to 25 AWS accounts and wants a well-architected multi-account landing zone with centralized logging, SSO, and preventive and detective guardrails, set up as quickly as possible. What should it use?",
    options: [
      { text: "AWS Control Tower.", correct: true, why: "Control Tower automates a landing zone with Organizations, IAM Identity Center, log archive/audit accounts, and managed controls." },
      { text: "Manually create accounts and write SCPs from scratch.", correct: false, why: "Slow, error-prone, and more overhead." },
      { text: "AWS Service Catalog alone.", correct: false, why: "Catalogues approved products; doesn't build a landing zone." },
      { text: "A single account with many VPCs.", correct: false, why: "Loses the isolation and blast-radius benefits of multiple accounts." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Secure Architectures",
    pick: 1,
    question:
      "A security team must deploy the same IAM roles, Config rules, and CloudTrail settings to every existing and future account in specific OUs across multiple Regions. Which solution requires the LEAST ongoing effort?",
    options: [
      { text: "CloudFormation StackSets with service-managed permissions and automatic deployment to the target OUs.", correct: true, why: "StackSets deploy stacks across accounts and Regions, and auto-deploy to accounts added to the OU later." },
      { text: "Run a script from a laptop against each account whenever a new one is created.", correct: false, why: "Manual and easily forgotten." },
      { text: "Copy CloudFormation templates into each account's S3 bucket.", correct: false, why: "Templates sitting in buckets don't deploy themselves." },
      { text: "AWS Elastic Beanstalk.", correct: false, why: "Deploys applications, not account baselines." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design High-Performing Architectures",
    pick: 1,
    question:
      "An operations team wants CloudWatch alarms on EC2 memory utilization and disk space usage, but these metrics don't appear in CloudWatch. What should they do?",
    options: [
      { text: "Install and configure the CloudWatch agent on the instances to publish memory and disk metrics.", correct: true, why: "The hypervisor can't see inside the guest OS; memory and disk usage need the agent." },
      { text: "Enable detailed monitoring.", correct: false, why: "Detailed monitoring only increases the frequency of default metrics to 1 minute." },
      { text: "Enable VPC Flow Logs.", correct: false, why: "Network metadata only." },
      { text: "Turn on AWS Config.", correct: false, why: "Configuration tracking, not performance metrics." },
    ],
  },
  {
    topic: "Cost Management & Governance",
    domain: "Design Cost-Optimized Architectures",
    pick: 1,
    question:
      "A FinOps team needs the most granular, line-item billing data for all accounts in the organization, including resource IDs and tags, to build custom reports with SQL. What should they use?",
    options: [
      { text: "AWS Cost and Usage Report (CUR 2.0 via Data Exports) delivered to S3 and queried with Athena.", correct: true, why: "CUR is the most detailed billing dataset, designed for SQL analysis with Athena or BI tools." },
      { text: "Cost Explorer's monthly service view.", correct: false, why: "Aggregated views, not line-item detail." },
      { text: "AWS Budgets reports.", correct: false, why: "Budget tracking, not full billing detail." },
      { text: "CloudTrail logs.", correct: false, why: "API activity, no cost data." },
    ],
  },
];
