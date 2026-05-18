from datetime import datetime, timedelta


def get_mock_emails():
    base = datetime.now()

    return [
        # ── URGENT (3) ──────────────────────────────────────────────────────
        {
            "id": "email_001",
            "from": "sarah.chen@techcorp.com",
            "from_name": "Sarah Chen",
            "subject": "URGENT: Production Server Down — Immediate Action Required",
            "body": """Hi Team,

Our production server (prod-us-east-1) went down at 14:23 EST. We're seeing 502 errors across all services.
Customer support is being flooded with complaints. Revenue impact is approximately $50k/hour.

I've already escalated to the infrastructure team but we need your immediate help to:
1. Check the database connections
2. Review the latest deployment logs
3. Coordinate with AWS support (case #8837291)

Every minute counts. Please respond IMMEDIATELY.

Best,
Sarah Chen
VP of Engineering, TechCorp""",
            "timestamp": (base - timedelta(hours=1)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },
        {
            "id": "email_002",
            "from": "james.wilson@enterprise-client.com",
            "from_name": "James Wilson",
            "subject": "URGENT: $2.5M Contract Deadline Tomorrow — Need Your Signature",
            "body": """Hello,

I'm reaching out one final time regarding our $2.5M enterprise contract. The legal team has set a hard
deadline of tomorrow at 5 PM EST for the signature. If we miss this window, the procurement process
resets and we're looking at another 3-month delay — which neither of our boards will accept.

I've attached the final version with all negotiated changes incorporated. Please review pages 12–15
which contain the revised SLA terms we agreed upon in our call last Thursday.

This deal is critical for Q4 targets on both sides. Please confirm receipt and your signing timeline.

Regards,
James Wilson
Enterprise Sales Director, EnterpriseClient Corp""",
            "timestamp": (base - timedelta(hours=3)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },
        {
            "id": "email_003",
            "from": "alerts@monitoring.datadog.com",
            "from_name": "Datadog Alerts",
            "subject": "[CRITICAL] CPU 98% — API Gateway Overloaded for 15+ Minutes",
            "body": """ALERT: Critical threshold exceeded

Service:       API Gateway (prod-us-east-1)
Metric:        CPU Utilization
Current Value: 98.3 %
Threshold:     90 %
Duration:      18 minutes and counting

This alert triggered because your API Gateway has been at critical CPU utilisation for over 15 minutes.
Left unaddressed this will cause service degradation or a complete outage.

Recommended Actions:
  1. Check for unusual traffic spikes in your Datadog dashboard
  2. Review recent deployments (last deploy: 2024-10-15 13:47 UTC)
  3. Consider horizontal scale-out (current: 3 nodes → recommended: 6)

Alert ID:  ALT-29847
Dashboard: https://app.datadoghq.com/dashboard/prod-api-gateway

— Datadog Alerting System""",
            "timestamp": (base - timedelta(minutes=45)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },

        # ── FOLLOW-UP (4) ───────────────────────────────────────────────────
        {
            "id": "email_004",
            "from": "maya.patel@gmail.com",
            "from_name": "Maya Patel",
            "subject": "Following Up on My Senior Engineer Application — Job ID SWE-2024-089",
            "body": """Dear Hiring Manager,

I hope this message finds you well. I'm writing to follow up on my application for the Senior Software
Engineer position (Job ID: SWE-2024-089) submitted two weeks ago.

I remain very enthusiastic about the opportunity. My 6 years of experience in distributed systems and
my recent work building real-time data pipelines at Stripe (processing 4M events/sec) align well with
the requirements in the job description.

I'd love to discuss how my background could contribute to your team. Could you share any update on
the application status or expected timeline for first-round interviews?

Thank you for your time and consideration.

Best regards,
Maya Patel
LinkedIn: linkedin.com/in/mayapatel-eng
GitHub:   github.com/mayap-eng""",
            "timestamp": (base - timedelta(days=2)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },
        {
            "id": "email_005",
            "from": "david.kim@partnerco.com",
            "from_name": "David Kim",
            "subject": "Follow-Up: Q3 Integration Project — API Docs & Sandbox Still Missing",
            "body": """Hi,

Following up on the Q3 integration project we discussed last week. Our dev team has been blocked
waiting for the API documentation and sandbox credentials you mentioned would be ready by last Friday.

The project timeline is already tight — we're targeting an October 15 go-live — and we can't start
meaningful development without access to the test environment.

Could you provide by EOD tomorrow:
  1. Updated API documentation (v2.3 — the version with the new webhooks)
  2. Sandbox API keys for our dev team (3 engineers need access)
  3. Status on the webhook endpoint bug fix (ticket #PAR-1892)

Our CTO is asking for a status update in tomorrow's standup. Any help appreciated.

Thanks,
David Kim
Technical Lead, PartnerCo""",
            "timestamp": (base - timedelta(days=1)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },
        {
            "id": "email_006",
            "from": "billing@cloudservices.io",
            "from_name": "CloudServices Billing",
            "subject": "Payment Reminder: Invoice #INV-2024-0892 — 30 Days Overdue ($4,750)",
            "body": """Dear Customer,

This is a friendly reminder that Invoice #INV-2024-0892 is now 30 days past due.

Invoice Details:
  Invoice Number:  INV-2024-0892
  Issue Date:      September 1, 2024
  Due Date:        September 30, 2024
  Amount Due:      $4,750.00
  Services:        Cloud infrastructure — September 2024 (3× m5.2xlarge, 10 TB egress)

Please arrange payment at your earliest convenience to avoid service interruption. If you have already
sent payment please disregard this notice and allow 2 business days for processing.

Pay online:    https://billing.cloudservices.io/pay/INV-2024-0892
Dispute:       billing@cloudservices.io
Auto-pay:      You can enable auto-pay to avoid future reminders

Best regards,
CloudServices Billing Team""",
            "timestamp": (base - timedelta(days=3)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },
        {
            "id": "email_007",
            "from": "rachel.thompson@nextstartup.com",
            "from_name": "Rachel Thompson",
            "subject": "Following Up: Interview Feedback + Any Remaining Questions — Full Stack Role",
            "body": """Hi,

Thank you again for interviewing with us last week for the Full Stack Engineer position. We genuinely
enjoyed our conversation and were impressed by your work on the distributed caching layer.

I wanted to follow up on two fronts:

1. Feedback: We're always looking to improve our candidate experience. Could you share any thoughts
   on the interview process — what worked well, what we could improve?

2. Questions: Do you have any remaining questions about the role, compensation (we're targeting
   $180–220k base + equity), or our tech stack (React 18, Node.js, PostgreSQL, Kubernetes on GKE)?

We're finalising decisions this week and would love to keep the conversation going if you're still
interested.

Warm regards,
Rachel Thompson
Head of Talent Acquisition, NextStartup""",
            "timestamp": (base - timedelta(hours=18)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },

        # ── ACTION-REQUIRED (4) ─────────────────────────────────────────────
        {
            "id": "email_008",
            "from": "calendar@company.com",
            "from_name": "Michael Roberts (CEO)",
            "subject": "Meeting Invite: Q4 Strategy Planning — RSVP Required by Wednesday EOD",
            "body": """You have been invited to:

  Q4 2024 Strategy & OKR Planning Session
  Date:      Thursday, October 24, 2024
  Time:      2:00 PM – 5:00 PM EST
  Location:  Conference Room A (Building 2) + Zoom (link in calendar)
  Organiser: Michael Roberts (CEO)

Agenda:
  1. Q3 Review & Lessons Learned (30 min)
  2. Market Analysis & Competitive Landscape (45 min)
  3. Product Roadmap 2025 — First Look (60 min)
  4. Resource Allocation & Q4 Hiring Plan (45 min)
  5. OKR Setting for Q4 (30 min)

Preparation Required:
  Please prepare a 5-minute department update covering:
    • Your team's top 3 Q3 achievements
    • Top 2 Q4 priorities and resource needs
    • Any blockers requiring exec attention

Please RSVP by Wednesday EOD so we can finalise the room booking.

[ACCEPT]  [DECLINE]  [TENTATIVE]""",
            "timestamp": (base - timedelta(hours=6)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },
        {
            "id": "email_009",
            "from": "legal@company.com",
            "from_name": "Jennifer Martinez (Legal)",
            "subject": "ACTION REQUIRED: Sign Acme Corp Mutual NDA Before Tuesday's Meeting",
            "body": """Hi,

The legal team has prepared the mutual NDA for the Acme Corp partnership discussions scheduled for
Tuesday, October 22. This document must be reviewed and signed before the meeting can proceed.

Document: Acme_Corp_Mutual_NDA_v2.pdf (attached)

Key terms to review:
  • Confidentiality period: 3 years from signing
  • Scope: Limited strictly to the proposed data analytics partnership
  • Carve-outs: Publicly available information; independent development; regulatory disclosure
  • Governing law: Delaware; dispute resolution via AAA arbitration

Deadline: Friday, October 18th (DocuSign link below)

If you have any concerns about the terms please contact me before signing — do NOT redline the
document directly as we've already negotiated this version with Acme's counsel.

DocuSign: [Sign Document — link expires Oct 18]

Best,
Jennifer Martinez
General Counsel""",
            "timestamp": (base - timedelta(hours=12)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },
        {
            "id": "email_010",
            "from": "compliance@financeplatform.com",
            "from_name": "FinancePlatform Compliance",
            "subject": "REQUIRED: Annual Security Questionnaire Due October 25 — Non-Negotiable",
            "body": """Dear Vendor Partner,

As part of our annual vendor security review (required for our SOC 2 Type II recertification), all
technology partners must complete our security questionnaire by October 25, 2024.

Questionnaire Details:
  • 45 questions across: Data Security, Access Controls, Incident Response, Business Continuity
  • Estimated time: 2–3 hours
  • Hard deadline: October 25, 2024 at 11:59 PM PST
  • Portal: https://vendor.financeplatform.com/security-review

Missing this deadline will result in:
  ✗ Suspension of API access (effective October 26)
  ✗ Delayed contract renewal (90-day delay minimum)
  ✗ Additional audit requirements before reinstatement

If you need an extension for a legitimate reason, you must request it in writing by October 20.
Extensions are granted at the discretion of our CISO and are rarely approved.

Questions: security@financeplatform.com

Regards,
FinancePlatform Compliance & Security Team""",
            "timestamp": (base - timedelta(days=4)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },
        {
            "id": "email_011",
            "from": "ceo@company.com",
            "from_name": "Alex Johnson (CEO)",
            "subject": "Needs Your Approval: Emergency Infrastructure Budget — $75,000 by EOD Tomorrow",
            "body": """Hi,

I need your approval on an emergency budget request before EOD tomorrow. Details:

  Department: Engineering
  Request ID: REQ-2024-1089
  Amount:     $75,000 (one-time)
  Purpose:    Emergency database infrastructure upgrade

Background:
  Our primary database cluster (db-prod-01) is showing hardware failure indicators. The RAID controller
  has logged 17 uncorrectable read errors in the past 48 hours (vs. our normal baseline of 0–2/week).
  Our SRE team gives it a 40% probability of failure within 10 days. Peak traffic season starts Nov 1.

Proposed Solution:
  • Migrate to AWS Aurora PostgreSQL ($4,200/month vs. current $6,800 — saves $31k/year)
  • One-time migration cost: $75,000 (consulting firm + 3 engineers for 2 weeks)
  • ROI break-even: 18 months; risk-adjusted expected value strongly positive

Full technical spec and 3 vendor quotes attached.

Please approve or reject via the finance portal by EOD tomorrow:
  https://finance.company.com/approvals/REQ-2024-1089

Alex Johnson
CEO""",
            "timestamp": (base - timedelta(hours=8)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },

        # ── NEWSLETTER (4) ──────────────────────────────────────────────────
        {
            "id": "email_012",
            "from": "newsletter@tldr.tech",
            "from_name": "TLDR Tech",
            "subject": "TLDR: OpenAI's new model beats GPT-5, Rust tops language ranking for 9th year",
            "body": """TLDR — Daily Tech Newsletter | October 15, 2024

TOP STORIES

🤖 AI & Machine Learning
OpenAI releases GPT-5 successor with 2M context window
The latest model from OpenAI demonstrates remarkable improvements in multi-step reasoning and code
generation, scoring 92% on the MMLU benchmark. Early enterprise customers report 40% productivity gains.

⚡ Developer News
Rust tops Stack Overflow's Most Loved Languages for 9th consecutive year
The 2024 Developer Survey results are in. Rust holds strong with 83% of users saying they want to
continue using it. TypeScript holds steady at #2; Zig enters the top 10 for the first time.

☁️ Cloud & Infrastructure
AWS announces 30% price reduction on EC2 compute-optimised instances
Effective November 1st, c6i and c7g instance families see the steepest cuts as competition with
Google Cloud and Azure intensifies.

📱 Product Launches
Figma releases AI-powered design system generator
The new feature converts brand guidelines and a logo file into a complete Figma design system —
typography, colour tokens, components — in under 60 seconds.

📊 By the Numbers
• GitHub Copilot now used by 1.8M developers (+200% YoY)
• LLM inference costs down 90% vs. GPT-3 launch in 2020
• Open-source AI model releases: 3,400 in Q3 2024 alone

— Unsubscribe | View in browser | Manage preferences —""",
            "timestamp": (base - timedelta(hours=4)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },
        {
            "id": "email_013",
            "from": "digest@aiweekly.substack.com",
            "from_name": "AI Weekly Digest",
            "subject": "AI Weekly #147: LangGraph 2.0 ships, multi-agent systems go mainstream",
            "body": """AI WEEKLY | Issue #147 | October 15, 2024

This week in AI...

FEATURE: The Rise of Multi-Agent Systems
After years of single-agent hype, 2024 is the year multi-agent architectures go production.
Companies like AutoGPT, CrewAI, and LangGraph are leading the charge, with enterprise adoption
up 340% year-over-year according to a16z's latest State of AI report.

RESEARCH HIGHLIGHTS
• "Mixture of Agents" (Together AI) — 65% improvement over single large models on reasoning tasks
• Stanford releases AgentBench — first rigorous benchmark for agent systems across 8 task categories
• DeepMind's SAFE framework for autonomous agents gains backing from 12 major AI labs

TOOLS & FRAMEWORKS
→ LangGraph 2.0 released — stateful multi-agent support, time-travel debugging, Studio UI
→ OpenAI Swarm now production-ready with built-in observability
→ Anthropic Claude supports 100 parallel tool calls per request

INDUSTRY NEWS
• Google invests $500M in sovereign AI infrastructure across EU
• Meta open-sources Llama 3.3 70B with improved instruction following
• EU AI Act: high-risk system registration deadline 6 months away

TUTORIAL OF THE WEEK
"Building a production email agent with LangGraph and FastAPI" [10 min read]
Step-by-step guide to building exactly the kind of agentic system that's going mainstream.

---
Unsubscribe · Sponsor this newsletter: ads@aiweekly.com""",
            "timestamp": (base - timedelta(hours=5)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },
        {
            "id": "email_014",
            "from": "digest@producthunt.com",
            "from_name": "Product Hunt Weekly",
            "subject": "Top Products This Week: AI tools dominate — 23 launches in one category",
            "body": """PRODUCT HUNT WEEKLY | October 15, 2024

This Week's Top Products

🥇 #1 — ScreenshotOne AI  (1,847 upvotes)
Transform screenshots into professional marketing assets with AI. Auto-removes backgrounds, adds
device frames, generates social variants. Indie maker hit $8k MRR in first month.

🥈 #2 — Supermemory.ai  (1,203 upvotes)
Your AI-powered second brain. Import from Notion, Twitter, newsletters. Ask natural-language
questions about your personal knowledge base. 100k users in 2 weeks post-launch.

🥉 #3 — ShipFast 2.0  (987 upvotes)
The Next.js boilerplate for solo makers. Now includes built-in AI chat, Stripe billing, magic link
auth, and one-click Vercel deploy. Marc Lou's biggest launch yet.

#4 — Clerk AI  (743 upvotes) — Drop-in auth with AI-powered fraud detection
#5 — Supabase Vector  (681 upvotes) — pgvector now with 10× query performance

TRENDING THIS WEEK
→ AI Productivity Tools: 23 launches (↑ 47% vs last week)
→ Developer Tools: 18 launches
→ No-Code / Low-Code: 12 launches

MAKER SPOTLIGHT
@buildinpublic crossed $10k MRR with their solo AI writing SaaS built in 3 weekends.
"The bar for launching has never been lower. Ship and iterate."

— The Product Hunt Team · Unsubscribe · Advertise""",
            "timestamp": (base - timedelta(hours=7)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },
        {
            "id": "email_015",
            "from": "newsletter@hackernewsdigest.com",
            "from_name": "Hacker News Digest",
            "subject": "HN Digest: Postgres vs MySQL 2024, Why I left big tech, Show HN winners",
            "body": """HACKER NEWS DIGEST | Top Stories | October 15, 2024

TOP DISCUSSIONS THIS WEEK

1. "PostgreSQL vs MySQL in 2024: A definitive comparison"  (847 points · 312 comments)
   After years of both being "good enough," the gap is widening. Comprehensive analysis covers
   performance benchmarks, JSON/JSONB support, logical replication, and ecosystem maturity.
   Verdict: Postgres wins for new projects; MySQL wins for existing WordPress stacks.

2. "Why I left FAANG after 8 years to build my own company"  (1,243 points · 489 comments)
   Thoughtful account of trading $600k comp for autonomy and ownership. The comments thread
   became an impromptu career-advice AMA — worth reading the top 20.

3. Show HN: Self-hostable AI email agent using LangGraph  (562 points · 127 comments)
   "Got frustrated with cloud AI email tools. Built my own — open source, runs locally,
   surprisingly good results with the Groq API." Community loved the architecture writeup.

4. "The hidden complexity of timezone handling"  (623 points · 201 comments)
   Every developer's nightmare, explained. UTC everywhere? Daylight saving edge cases say no.

5. Ask HN: Most valuable skill learned in 2024?
   Top answers: Prompt engineering (with evals), Systems design, Financial literacy, Kubernetes

WEEKLY STATS
1,247 submissions · 847k comments · 4.2M upvotes

---
Unsubscribe · hn.algolia.com for search""",
            "timestamp": (base - timedelta(hours=9)).isoformat(),
            "status": "unprocessed",
            "category": None,
            "priority_score": None,
            "priority_reasoning": None,
            "draft_reply": None,
            "processed_at": None,
        },
    ]
