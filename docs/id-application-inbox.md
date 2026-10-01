# Central Legal ID application inbox: integration runbook

## Architecture and existing infrastructure

Neuro Admin runs as a Next.js standalone Node server in Azure App Service. Its existing Neuron `HttpSessionID` login and QuickLogin validation authorize the inbox. Before this feature, the repository had no shared application database or server-side XMPP consumer. It already sent identity outcome email through SendGrid using `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`; the inbox reuses those settings and SendGrid's HTTP API. Azure Monitor was telemetry, not persistence. V1 introduced Azure Table Storage and `@azure/data-tables` for shared alerts, discovery records, audit transitions, and a receiver lease. It introduced `@xmpp/client` for the persistent XMPP connection. Those are new production dependencies; no second email provider was added.

On each test Neuron: **Event Filter → XMPP Event Sink → central receiver bare JID**. The receiver authenticates as a dedicated XMPP account, accepts `urn:xmpp:eventlog` messages only from enabled registry JIDs, stores selected alerts in Azure Table, and sends SendGrid email. The dashboard polls every five seconds. Acknowledgement and handling use Azure Table ETags, so only one concurrent claim succeeds. Manual approval/rejection remains in Neuron.

## Receiver lifecycle and deployment

`src/instrumentation.js` starts `src/lib/idAlerts/receiver.mjs` when a **Node** server instance starts and `ID_ALERT_RECEIVER_ENABLED=true`. Next.js calls `register()` once **per server instance**, not once per deployment. Startup validates configuration and Table access, then competes for the `receiver/leader` entity in the same table. One process holds a 30-second lease, renews every five seconds with an ETag compare-and-swap, and opens XMPP. Others poll in standby; they do not connect. On lease loss, expiry, or Table errors, the owner stops its XMPP client. A standby may take over after expiry. The `receiver/leader` row is operational state; do not edit or delete it manually. This allows multiple web processes or instances to share one receiver account and one table.

The client is `@xmpp/client`, instantiated in `startConnection()` with `service`, JID domain/username, password, and fixed resource `id-applications`. It authenticates with the library's SASL mechanism negotiation (the installed client offers SCRAM-SHA-1, PLAIN, then ANONYMOUS); use a dedicated password account. Standard C2S `xmpp://host:5222` negotiates STARTTLS when the broker advertises it; `xmpps://` is for a broker that actually supports direct TLS, and `wss://` is for secure WebSocket. For the lab receiver, DNS SRV `_xmpp-client._tcp.lab.tagroot.io` resolves to `lab.tagroot.io:5222`, so use `xmpp://lab.tagroot.io:5222` with domain `lab.tagroot.io`. It sends presence after `online`, advertises `urn:xmpp:eventlog` in disco#info, and the library reconnects after disconnection. `disconnect` and `error` change/report local state without logging payloads. SIGTERM/SIGINT stop XMPP and release the lease. The Node process and its timers keep the connection running while App Service keeps that process loaded.

Use **Always On** on the receiver-enabled App Service; Microsoft says an app without it is unloaded after 20 minutes without incoming requests. A slot swap, deployment, restart, scale event, process crash, or temporary Table outage can interrupt XMPP. The lease limits concurrent receivers, but does not make delivery durable or eliminate the failover gap. Neuron's [XMPP sink implementation](https://github.com/PeterWaher/IoTGateway/blob/master/Events/Waher.Events.XMPP/XmppEventSink.cs) explicitly increments `eventsLost` and drops an event if its sending client is disconnected; the receiver cannot recover that event from XMPP. Messages in flight at a disconnect can also be uncertain. Duplicate deliveries or a handover overlap are handled by the alert's deterministic key and Table create conflict, though SendGrid delivery remains at least once if a send succeeds and its `sent` update fails. Check the Neuron event log for `EventsLost` after reconnect. The architecture is suitable for this first live validation with monitored connectivity; it cannot promise lossless ingestion.

The deployment workflow sends the same artifact to several **different** App Services/slots. Enable the receiver only on the designated central site; its scaled instances coordinate through the lease. Keep development, staging, and production on separate receiver JIDs and tables, with their App Settings marked slot-specific where slots are used. All instances participating in **one** receiver must have the same table, JID, password, Neuron registry, and selected EventIds. Never point independent receiver deployments at the same JID with different tables, or let a staging process with discovery settings acquire the production lease. `/api/id-applications/health` is operator-protected and reports local role (`leader` or `standby`) plus shared lease `active`, `connected`, and `expiresAt`; readiness is 503 if enabled but the shared lease is not connected. The shared connection status is updated on each lease renewal, so it can lag by about five seconds. A production build verifies packaging, not these runtime conditions.

## Configuration

Set these as server-side App Settings or local secrets; none are `NEXT_PUBLIC_*`.

| Setting | Value |
| --- | --- |
| `ID_ALERT_RECEIVER_ENABLED` | `true` on the App Service intended to run the receiver; other sites may share the table for the inbox. |
| `ID_ALERT_XMPP_SERVICE` | Actual XMPP endpoint. For the lab SRV record use `xmpp://lab.tagroot.io:5222` with STARTTLS. Use `xmpps://` or `wss://` only where the broker supports those transports. |
| `ID_ALERT_XMPP_JID`, `ID_ALERT_XMPP_PASSWORD` | Dedicated central account bare JID and password. The sink recipient is this bare JID. |
| `ID_ALERT_NEURONS` | JSON registry of unique `{ "id", "name", "jid", "customerId", "enabled" }`; `jid` is the authenticated sender's **bare** JID, verified in discovery. |
| `ID_ALERT_STORAGE_CONNECTION_STRING`, `ID_ALERT_TABLE` | Shared Azure Table connection and optional table name (`IdApplicationAlerts` by default). Azurite `UseDevelopmentStorage=true` works locally. |
| `ID_ALERT_DISCOVERY` | `true` only while discovering test events. Up to 100 events retained; records older than 24 hours are removed on the next discovery write. Disable after selection. |
| `ID_ALERT_EVENT_IDS` | Comma-separated, **observed** XEP-0337 `log/@id` values. Empty during discovery: no alert or email is created. Changes require receiver process restart/redeploy because configuration is loaded at startup. |
| `ID_ALERT_APPLICATION_REF_TAGS`, `ID_ALERT_LEGAL_ID_REF_TAGS` | Optional comma-separated tag names, only after a real event confirms they identify the application or Legal ID. |
| `ID_ALERT_OPERATOR_IDS` | Comma-separated `neuron-host:JWT-sub` values allowed to see all configured Neurons. Sign in and read `/api/id-applications/whoami` for the exact value. |
| `ID_ALERT_DEBUG_OPERATOR_IDS` | Subset of operator IDs allowed to view raw XML and discovery records. |
| `ID_ALERT_PUBLIC_ORIGIN` | Exact browser origin for a deployment behind a proxy that changes the request URL, for example `https://dev.neuro.services`. Set per slot. Status changes accept this origin or the request URL origin; no wildcard or forwarded host is trusted. |
| `ID_ALERT_ORIGIN_DIAGNOSTICS` | Set to `true` temporarily to log the origin, request URL origin, Host, and forwarded host/protocol when the configured public origin is used. Turn off after diagnosis. |
| `ID_ALERT_OPERATOR_EMAILS` | Comma-separated destinations; required in production once EventIds are selected and alerts can be created. |
| `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` | Existing SendGrid credentials and sender; required in production once EventIds are selected. Discovery with an empty EventId list does not send alerts. |

Example `ID_ALERT_NEURONS` (replace every value):

```json
[{"id":"id-a","name":"ID Neuron A","jid":"events@a.example","customerId":"customer-a","enabled":true},{"id":"id-b","name":"ID Neuron B","jid":"events@b.example","customerId":"customer-b","enabled":true}]
```

The operator allowlist is for a central team with access to **all** registered customers. Use separate deployments and tables where teams must be isolated.

## XEP-0337 compatibility and discovery

The [XEP-0337 format](https://xmpp.org/extensions/xep-0337.html) puts one or more `<log xmlns="urn:xmpp:eventlog">` elements directly in a normal XMPP message. `timestamp` and child `message` are required; `id` is an optional EventId, not an individual application ID. Type and level default to `Informational` and `Minor`. Optional fields include `object`, `subject`, `facility`, `module`, repeated typed tags, `stackTrace`, and outer `xml:lang`. Neuron's [actual sink code](https://github.com/PeterWaher/IoTGateway/blob/master/Events/Waher.Events.XMPP/XmppEventSink.cs) serializes its `Event.Actor` as XEP `subject`, uses XML escaping, and emits a normal message. The parser handles multiple logs in one stanza, XML escapes, absent optional attributes, and unknown extensions (preserved in raw XML). Discovery additionally exposes a `tagList` so duplicate names and types are visible. `tags` is a convenient name-to-last-value map; do not infer a unique reference from a repeated name without examining `tagList`.

The full raw event and stanza, sender JID, timestamp, EventId, type, level, message, actor/subject, object, facility, module, tags, language, and stack trace are stored only from an enabled sender. Open **Neuro Access → ID inbox → Event discovery** as an authorized **debug operator** to view recent records. The API is `/api/id-applications/discovery`; normal inbox users cannot access it. Routine logs contain event outcomes/error names, not raw payloads. Discovery may contain personal data: use test applications and restrict debug access. If the sender is unknown, ingestion rejects it and no discovery record is created; verify the outgoing Neuron JID through Neuron XMPP diagnostics and update the registry before retesting.

During discovery keep `ID_ALERT_EVENT_IDS` empty. Correlate a test application's submission time with a captured event, inspect the exact `eventId`, message and tags, and confirm the authenticated source JID. **Do not equate** the native setting `BROKER_NOT_LEGAL_ID_RECEIVED` with an EventId. After observing an event, set `ID_ALERT_EVENT_IDS` to its exact `log/@id`, restart the receiver process, and narrow the Neuron Event Filter to that EventId. If no EventId appears, or one EventId covers several unrelated events, stop and inspect a second real event before selecting a classifier. Reference tag settings improve deduplication only when their values are stable and unique; choose them from captured events. If an EventId alone is too broad, the current app has no extra predicate and needs an evidence-based correction before production use.

## Neuron-side setup: test Neuron A

The [custom sink feature](https://lab.tagroot.io/Community/Tag/gateway) dates from build **2026-01-06**. Confirm that A's installed build has it. The [2026-09-23 release](https://lab.tagroot.io/ReleaseNotes/2026-09-23/Build_2026_09_23_This_release_contains_the_following) fixes Legal Identity notifications; test that build's behavior if used, but this is not a documented minimum for the sink.

1. Supply the operator with the central **receiver bare JID**, its XMPP domain, and the central broker route. Create the receiver account and put its credentials/TLS service URL in Neuro Admin App Settings. Confirm it can authenticate and receive messages. Neuron A needs its own working outbound XMPP client/account and a route or federation permission to address the receiver JID; it does **not** need the receiver's password. Confirm its actual sending bare JID and put that in `ID_ALERT_NEURONS` with `enabled:true`.
2. In Neuron Admin go to **Sources & Nodes → Gateway configuration → EventSinks**. Add an **Event Filter** with a unique **Sink ID**. Under it add an **XMPP Event Sink** with its own Sink ID and **Recipient JID** set to the central receiver bare JID. The [filter node](https://lab.tagroot.io/Documentation/CodeDoc/html/d3/d43/class_waher_1_1_service_1_1_io_t_broker_1_1_sources_1_1_gateway_config_1_1_event_sink_nodes_1_1_event_filter_node.html) accepts child sinks; the [XMPP node](https://lab.tagroot.io/Documentation/CodeDoc/html/d5/d7b/class_waher_1_1_service_1_1_io_t_broker_1_1_sources_1_1_gateway_config_1_1_event_sink_nodes_1_1_xmpp_event_sink_node.html) has a JID recipient property.
3. For discovery leave **Event IDs** blank. The official filter help says blank allows all EventIds, including events with none. Set the type/level controls to admit the application's unknown level; for this **test Neuron**, include the lowest available level for all event types, then narrow after discovery. Broad discovery can forward sensitive events, so use test data and a short window. Save/apply the nodes. Verify the sink appears active; the published UI documentation does not establish whether this edit takes effect immediately. If it does not, use a controlled Neuron restart and retest. Editing `Gateway.config` directly should be followed by a restart and verification.
4. Independently keep native operator notification as a safety net: on build **2026-07-25 or later**, open **Notarius Electronicus → Notifications** and enable the **Legal ID received** notification, or set `BROKER_NOT_LEGAL_ID_RECEIVED` in Neuron's environment according to local deployment practice. This setting controls Neuron's native notification, not the XMPP recipient or the EventId. [Official notification documentation](https://lab.tagroot.io/Community/Tag/admin).

If a sink reports an authentication or routing error, inspect the Neuron-side XMPP client configuration, broker connection and federation policy. The XMPP Event Sink node specifies a recipient, not separate receiver credentials.

## TEST 1 — Neuron A live checklist

Start with `ID_ALERT_DISCOVERY=true`, an empty `ID_ALERT_EVENT_IDS`, A registered and a debug operator signed in. Record the test application's submission time and a non-sensitive reference for correlation. Do steps 1–6 first, then configure the observed EventId and submit a **second** new application for steps 7–14; discovery alone intentionally does not create alerts.

| # | Action and expected result | Inspect | If it fails |
| --- | --- | --- | --- |
| 1 | Start central app; shared lease becomes active/connected, exactly one process logs lease acquired and XMPP connected. | Signed-in `/api/id-applications/health`; App Service logs. | 503/storage false: Table/config; active but disconnected: TLS, DNS, SASL, account, or broker; no lease: receiver disabled/startup failure. |
| 2 | Verify A is `enabled:true` with the **actual** sender bare JID. | Inbox **Configured Neurons**, App Settings registry, Neuron XMPP diagnostics. | A mismatch will reject the event before discovery. |
| 3 | Submit a new test Legal ID application to A; record exact time/reference. | Neuron A application/admin view and event log. | If submission is absent there, troubleshoot the Neuron application flow first. |
| 4 | A corresponding XEP-0337 event arrives. | Inbox **Event discovery**, raw stanza and Neuron XMPP sniffer/event log. | No record: check filter level/Event IDs, sink activation, recipient route, connection, sender allowlist, or `EventsLost`. |
| 5 | Read the actual `eventId` from `log/@id` (may be empty). | Discovery JSON/raw XML. | Empty or ambiguous ID: do not configure an assumed ID; inspect another application event. |
| 6 | Identify reference fields and exact sender bare JID; preserve the fixture. | Discovery `tagList`, tags, message, subject, raw XML, `sourceJid`. | No stable reference: use fallback dedup key; wrong JID: correct registry/routing and retest. |
| 7 | Set observed `ID_ALERT_EVENT_IDS`, verified tag names if any; narrow Neuron filter, disable discovery, restart receiver. Submit a second **new** application. | App Settings, Neuron filter, health after restart. | If receiver fails to reconnect or EventId does not match exactly, no alert is expected. |
| 8 | New alert persists once in Azure Table `alerts` partition with correct source, EventId, timestamp, message, and `notificationState`. | Azure Table Storage explorer; `/api/id-applications` and detail API. | No row: ingestion, EventId, sender or Table error; duplicate row: dedup key issue. |
| 9 | One operator email is accepted/delivered for the second application. | SendGrid activity/recipient inbox; `notificationState=sent`. | `pending`: inspect SendGrid settings/activity and retry logs; accepted but not delivered: delivery/suppression issue. |
| 10 | Alert appears as **NEW** under A and correct customer within one dashboard refresh (about five seconds). | `/neuro-access/id-inbox`. | Table row but no UI: authorization, polling/API or customer mapping issue. |
| 11 | Operator clicks **I'm handling this**; state becomes ACKNOWLEDGED. | Inbox detail/API. | 409: another operator claimed it; 403: operator allowlist/session. |
| 12 | `acknowledgedBy` equals signed-in `/whoami` ID and `acknowledgedAt` is set; audit trail contains one acknowledgement. | Detail API, Azure Table entity. | Missing/mismatched metadata: conditional update issue. |
| 13 | Complete existing manual work in Neuron, then the same operator clicks **Mark handled**. | Neuron admin plus inbox detail. | Button absent: wrong operator or state; no central Approve/Reject is performed here. |
| 14 | Status becomes HANDLED; `handledBy`, `handledAt`, and audit trail are correct. | Detail API and Azure Table entity. | Missing update: inspect status API response and ETag conflict. |

## TEST 2 — two independent Neurons

Configure Neuron B with its own Event Filter and child XMPP Event Sink to the **same central receiver JID**, same observed EventId if its payload confirms it, and its distinct sender bare JID in `ID_ALERT_NEURONS`. Keep both on the same central Table and inbox. If B differs in EventId or field shape, capture B in discovery before adding it to `ID_ALERT_EVENT_IDS`.

| # | Action and expected result | Inspect | If it fails |
| --- | --- | --- | --- |
| 1 | Submit Application A to A and Application B to B; both yield one alert/email each. | Both Neuron event logs, SendGrid, central inbox and Table. | Missing one: its sink/filter/JID/routing or application event differs. |
| 2 | Both NEW rows share the inbox but show distinct A/B source and correct customer/reference. | Dashboard, `/api/id-applications`, Table `sourceNeuronId`/`sourceJid`. | Mislabel: registry or source mapping; same key across sources should still produce two rows. |
| 3 | Acknowledge B only. B becomes ACKNOWLEDGED; A remains NEW. | Two signed-in dashboard sessions, Table rows. | If A changes, source/key or UI selection is wrong. |
| 4 | With a fresh B alert, two operators click **I'm handling this** nearly simultaneously. Exactly one succeeds; the other receives HTTP 409/conflict and refreshes to the winning owner's state. | Browser Network responses, both inboxes, one Table audit entry. | Two successes or two audit claims indicate broken ETag protection. |
| 5 | The winner handles B after manual Neuron work. B becomes HANDLED with that operator/timestamp; A stays independent. | Detail API and Table audit trail. | Wrong owner handling succeeds: status authorization failure. |

No real test Neuron, broker account, deployment credentials, or captured Legal ID event is available in this repository. These live observations are the release gate.
