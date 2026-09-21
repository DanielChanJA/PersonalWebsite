export interface Experience {
  id: string;
  company: string;
  role: string;
  dates: string;
  current?: boolean;
  bullets: string[];
  tags: string[];
  featuredImpact?: ImpactMetric[];
}

export interface ImpactMetric {
  value: string;
  label: string;
}

export const resumeSync = {
  source: "DANIELCHAN RESUME 2026-1.pdf",
  synchronizedOn: "2026-09-20"
} as const;

export const experiences: Experience[] = [
  {
    id: "coreweave",
    company: "CoreWeave",
    role: "Senior Security Software Engineer",
    dates: "Aug 2025 — Present",
    current: true,
    bullets: [
      "Engineered a hyperscale Elastic SIEM platform across five production clusters in three regions, centralizing 15TB of logs daily from Kubernetes fleets and 52 security sources—all delivered as code with Helm, Terraform, and ArgoCD.",
      "Led the move from cloud-hosted to on-premise Elastic, reducing annual vendor and subscription spend by more than $2M.",
      "Cut critical log ingestion latency by 83%, from roughly 30 minutes to under five, while maintaining 99.9% ingestion success.",
      "Built a Go service that discovers regional Kafka audit topics, generates Fleet policies, and opens onboarding PRs through a GitHub App—turning days of work into minutes.",
      "Designed a zero-trust posture using mutual TLS, Vault PKI, Okta SSO, and NIST-aligned session controls across the Elastic stack.",
      "Owned Terraform-managed multi-tenant RBAC and JIT elevation, eliminating standing over-privileged production access.",
      "Created digest-pinned GitHub Actions pipelines and a Tilt-based local environment capable of reproducing the complete stack."
    ],
    tags: ["Elastic", "Go", "Kubernetes", "Terraform", "Vault", "Kafka"],
    featuredImpact: [
      { value: "15TB", label: "of security logs centralized daily" },
      { value: "$2M+", label: "annual spend eliminated" },
      { value: "83%", label: "less critical log ingestion latency" }
    ]
  },
  {
    id: "verily",
    company: "Verily",
    role: "Senior Security Software Engineer · IAM Lead",
    dates: "Nov 2023 — Aug 2025",
    bullets: [
      "Led an internal access control platform in React and Go during Verily’s separation from Google, using CEL-powered auto-roles to support ABAC, RBAC, and PBAC for robotic and human identities.",
      "Architected an LLM security agent that converted Slack conversations into structured Jira tickets and sourced technical documentation, reducing SSO onboarding effort by an estimated 75% and saving 10+ engineering hours per request.",
      "Moved Okta configuration into Infrastructure as Code with GitHub, Spacelift, and Terraform for stronger visibility and control.",
      "Designed a partner identity program that let external collaborators use corporate identity providers to access Verily through Okta-based authentication and authorization.",
      "Architected and deployed Okta Workflows to automate user lifecycle management and privileged access governance for third-party SaaS applications, including Jira.",
      "Developed custom Okta connectors for Egencia, enabling SCIM-based user provisioning and lifecycle automation.",
      "Established a structured service-account identity program in Okta that streamlined engineering integrations and onboarded 87 service accounts.",
      "Led contractors onboarding third-party SaaS applications with SAML 2.0 and OIDC, enforcing least privilege through Okta Access Requests."
    ],
    tags: ["IAM", "Okta", "React", "Go", "Terraform", "LLM"]
  },
  {
    id: "shipt",
    company: "Shipt",
    role: "Senior Software Engineer · API Gateway",
    dates: "Feb 2023 — Oct 2023",
    bullets: [
      "Replaced a legacy Apache NGINX gateway with Gloo Mesh, Istio, and Auth0, removing the need for a dedicated DevOps team and enabling product teams to manage APIs independently."
    ],
    tags: ["Gloo Mesh", "Istio", "Auth0", "Platform"]
  },
  {
    id: "tiktok",
    company: "TikTok",
    role: "Security Software Engineer · AuthZ, AuthN & IAM",
    dates: "May 2022 — Dec 2022",
    bullets: [
      "Led three engineers across China and the U.S. to migrate heavy-read endpoints to a new authorization platform, bringing the release forward by four weeks.",
      "Built high-performance Thrift RPC and REST APIs in a service-mesh architecture supporting RBAC, ABAC, and PBAC.",
      "Designed a gatekeeper mechanism for safe feature rollouts across sensitive TikTok, Douyin, and Lark services."
    ],
    tags: ["Authorization", "Thrift RPC", "REST", "Service Mesh"]
  },
  {
    id: "slync",
    company: "Slync.io",
    role: "Software Engineer · Full Stack",
    dates: "Apr 2021 — Apr 2022",
    bullets: [
      "Built a real-time notification service on GCP Cloud Run and Pub/Sub for instant transaction and comment updates.",
      "Led a Pub/Sub-backed platform release that improved endpoint response time by 72% and eliminated P0 email incidents."
    ],
    tags: ["GCP", "Cloud Run", "Pub/Sub", "Microservices"]
  },
  {
    id: "freshbooks",
    company: "FreshBooks",
    role: "Software Engineer · Full Stack",
    dates: "Apr 2020 — Apr 2021",
    bullets: [
      "Developed internal tooling to preserve outgoing emails, giving incident teams impact analysis and replay capabilities during third-party provider outages.",
      "Built personalized dashboard experiences with the Segment API, tailoring content for trades users based on behavior and customer segments."
    ],
    tags: ["Full Stack", "Microservices", "Segment", "Product"]
  }
];
