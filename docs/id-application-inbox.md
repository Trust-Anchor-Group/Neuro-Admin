# Central Legal ID application inbox: V1 operations

## Current deployment and scope

- Dev inbox: https://dev.neuro.services/neuro-access/id-inbox
- Operator health: https://dev.neuro.services/api/id-applications/health
- Restricted discovery API: https://dev.neuro.services/api/id-applications/discovery
- Central receiver: `id-alerts-lab@lab.tagroot.io`, service `xmpp://lab.tagroot.io:5222` (STARTTLS).
- Confirmed EventId: `LegalIdRegistered`; legal identity reference tag: `ID`.
- One receiver, one Azure table, one inbox. The existing `ID_ALERT_NEURONS` registry is the only source allowlist/mapping.

| Neuron | Stable ID | Customer | Sender bare JID | State |
| --- | --- | --- | --- | --- |
| Lab Neuron | `lab-neuron` | `lab-test` | `lab.tagroot.io@tagroot.io` | Configured; real event and operator flow confirmed by user |
| BR ID Neuron | `br-id-neuron` | `br` | `br@sa.id.tagroot.io` (verified main gateway sniffer) | Registered in dev; pending filtered sink and live acceptance |

The BR website is `br.id.tagroot.io`. Its outgoing identity was independently verified by the user from the main gateway sniffer's `from` and publisher before registration. A website domain or displayed account label alone remains insufficient evidence for other sources.

## Processing, storage, and privacy

`LegalIdRegistered -> validate sender -> deduplicate -> persist NEW alert and channel jobs -> existing leader retry timer -> email + WhatsApp`.

The deterministic alert key includes stable Neuron ID, EventId and application/legal identity reference. Repeated delivery with another XMPP resource or timestamp creates no second alert when that reference exists. A reference-free fallback hashes source/EventId/timestamp/raw event; correct stable reference mapping is therefore required for reliable application deduplication. Changing a stable Neuron ID after onboarding can defeat deduplication.

Normal alerts retain source ID/name/bare JID/customer, application/legal reference, timestamps, ownership, status and action history. Arbitrary tags, raw XML and event messages are not retained in new alert rows or exposed by the normal list/detail/status APIs. Legacy rows are scrubbed during the notification migration pass without replaying old accepted sends. Notifications contain only friendly Neuron name, received time and inbox URL. Logs contain safe outcome/error codes and opaque alert hashes. The inbox DOM is marked for Hotjar suppression and Sentry replay blocking.

Discovery remains available with `ID_ALERT_DISCOVERY=true`, only to users in **both** operator and debug allowlists. It contains raw Legal ID data. Reads exclude records older than 24 hours; the leader's periodic retention pass removes old rows and retains at most 100. Storage outages can delay physical deletion. Storage administrators, backups and existing telemetry retention remain outside this UI access boundary. Do not paste discovery payloads into logs or tickets.

Provider callbacks are public endpoints but require valid signatures, bounded bodies, valid alert/attempt correlation and recipient/provider matching. They store only status, provider IDs, recipient hashes and safe error codes. SendGrid's account webhook can include unrelated mail metadata; the handler discards events without matching ID-inbox custom arguments and never logs callback bodies.

### Lifecycle and reliability limits

`src/instrumentation.js` starts the Node receiver when enabled. A shared Azure Table lease lasts 30 seconds, renews every five seconds, and permits one active receiver. Standbys take over after expiry. Lease loss closes XMPP. Keep App Service **Always On** enabled. Readiness requires Table access and an active connected shared lease, with up to five seconds of connection-status lag. Health reports notification configuration separately; missing provider settings must not stop ingestion.

The [Neuron XMPP sink](https://github.com/PeterWaher/IoTGateway/blob/master/Events/Waher.Events.XMPP/XmppEventSink.cs) can lose events while its gateway XMPP client is disconnected. Monitor receiver health and Neuron `EventsLost`; this transport cannot promise lossless ingestion across downtime. Keep the existing Neuron review process as the operational safety net.

### Notifications and retries

Each new alert atomically contains an email job and one WhatsApp job per configured individual recipient. The existing 30-second timer processes up to 100 actionable alerts per scan. Azure ETag claims prevent two workers sending the same recipient attempt. Human status changes, worker updates and callbacks use the same ETag, so they preserve each other's state. Provider calls are never made inside XMPP ingestion.

| State | Meaning/action |
| --- | --- |
| `pending`, `sending` | Queued, or a worker holds the send claim |
| `accepted` | Provider accepted the message; this is not proof of delivery |
| `delivered` | Signed callback reports delivery (email: all configured recipients) |
| `retry` | Provider definitely rejected submission; exponential retry from 30 seconds up to one hour, maximum 12 attempts |
| `blocked` | Missing/disabled provider configuration; rechecked after five minutes |
| `failed` | Definite submission failures exhausted the retry limit |
| `delivery_failed` | Provider accepted submission but later reported bounce/drop/undelivered; fix destination/provider condition before requeue |
| `unknown` | Timeout/5xx or worker/checkpoint failure may have occurred after acceptance; no automatic resend |
| `disabled` | Channel was disabled when this alert was created; enabling it affects new alerts only |

Accepted sends are never retried automatically. Neither provider offers an atomic transaction with Azure Table. To avoid duplicate messages, ambiguous outcomes are held for provider reconciliation. Signed callbacks can resolve them later. This trades automatic recovery of an uncertain send for avoiding spam; it is not a claim of exactly-once provider delivery.

After checking provider activity and confirming **no delivery**, an administrator with the table connection can explicitly requeue a terminal job:

```powershell
node scripts/retry-id-alert-notification.mjs <64-hex-alert-id> email <operator-id> --confirmed-not-delivered
```

For a team WhatsApp job, use its exact `whatsapp:<recipient-hash>` key from the authenticated alert detail API. `whatsapp` remains valid for legacy single-recipient jobs. A retry targets only that member; accepted/delivered jobs cannot be requeued. Load `ID_ALERT_STORAGE_CONNECTION_STRING` and `ID_ALERT_TABLE` securely into the process environment; do not paste the connection into shell commands or commits. The action is audited. Requeue is refused if any email recipient already has a recorded delivery, to avoid resending to them. Resolve partial email delivery individually through provider operations.

## Azure dev configuration

Resource group/app: `Neuro-Admin`; slot: `dev`; table: `IdApplicationAlerts` in `neuroidalertsdev`. Mark receiver, registry, origin, recipients, provider and storage settings slot-specific. Never enable an unrelated deployment against this receiver JID with a different table. Registry/config changes require process restart; saving App Settings restarts the slot.

| App Setting | Dev value or purpose |
| --- | --- |
| `ID_ALERT_RECEIVER_ENABLED` | `true` only on the designated central receiver site |
| `ID_ALERT_XMPP_SERVICE` | `xmpp://lab.tagroot.io:5222`; normal C2S negotiates STARTTLS |
| `ID_ALERT_XMPP_JID` | `id-alerts-lab@lab.tagroot.io` |
| `ID_ALERT_XMPP_PASSWORD` | Existing secret; never commit or print |
| `ID_ALERT_STORAGE_CONNECTION_STRING` | Existing Azure Table secret |
| `ID_ALERT_TABLE` | `IdApplicationAlerts` |
| `ID_ALERT_EVENT_IDS` | `LegalIdRegistered` (exact, case-sensitive) |
| `ID_ALERT_LEGAL_ID_REF_TAGS` | `ID` |
| `ID_ALERT_APPLICATION_REF_TAGS` | Leave empty unless a stable application reference tag is observed |
| `ID_ALERT_DISCOVERY` | `true` for restricted troubleshooting during V1 validation |
| `ID_ALERT_NEURONS` | Existing JSON registry shown below |
| `ID_ALERT_OPERATOR_IDS` | Exact `host:subject` from signed-in `/api/id-applications/whoami` |
| `ID_ALERT_DEBUG_OPERATOR_IDS` | Explicit subset authorized for raw discovery |
| `ID_ALERT_PUBLIC_ORIGIN` | `https://dev.neuro.services`; exact origin protection remains enabled |
| `ID_ALERT_ORIGIN_DIAGNOSTICS` | `false` after origin investigation |
| `ID_ALERT_EMAIL_ENABLED` | `true` (defaults true) |
| `ID_ALERT_OPERATOR_EMAILS` | `ali.ouamou@trustanchorgroup.com`; comma-separated actual email destinations |
| `SENDGRID_API_KEY` | Existing secret with Mail Send permission |
| `SENDGRID_FROM_EMAIL` | Existing verified SendGrid sender |
| `SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY` | Signing verification public key for this dev callback |
| `ID_ALERT_WHATSAPP_ENABLED` | `true` after sandbox setup; defaults false |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Twilio account credentials, kept in App Settings |
| `TWILIO_WHATSAPP_FROM` | Sandbox's sender as `whatsapp:+E164`; use Console's actual value |
| `TWILIO_WHATSAPP_TO` | Consenting operator's joined sandbox number as `whatsapp:+E164` |
| `ID_ALERT_WHATSAPP_RECIPIENTS` | Preferred comma-separated individual recipients, each `whatsapp:+E164`. Overrides `TWILIO_WHATSAPP_TO` when present, including when explicitly empty. Up to 20 unique recipients. |
| `TWILIO_WHATSAPP_CONTENT_SID` | Empty for dev freeform within service window; approved `HX...` Content SID for production |

Current registry:

```json
[{"id":"lab-neuron","name":"Lab Neuron","jid":"lab.tagroot.io@tagroot.io","customerId":"lab-test","enabled":true},{"id":"br-id-neuron","name":"BR ID Neuron","jid":"br@sa.id.tagroot.io","customerId":"br","enabled":true}]
```

Operators are authorized for all sources in this central inbox. Separate deployments/tables are required for teams that must not share customer access.

## Email setup

The confirmed recipient is configured in `ID_ALERT_OPERATOR_EMAILS`; no XMPP-derived recipient is used. Existing SendGrid API key/from settings are reused. Keep the sender verified in SendGrid.

Delivery tracking uses **Settings -> Mail Settings -> Event Webhook**:

1. Add/use the dedicated `Neuro Admin dev ID inbox` webhook, URL `https://dev.neuro.services/api/id-applications/notifications/sendgrid`.
2. Select Processed, Delivered, Deferred, Bounced and Dropped. Open/click tracking is unnecessary and disabled in ID notification requests.
3. Enable **Signed Event Webhook** and put its verification public key in `SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY` for dev.
4. Enable the webhook after deployment. Preserve other webhooks if present.
5. A fresh application's email state should progress from pending to accepted to delivered. Confirm receipt in the operator inbox as well; a provider delivery event means recipient mail-server acceptance, not that a person read it.

The signed webhook setup is described in [SendGrid's official documentation](https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/getting-started-event-webhook-security-features).

## Twilio WhatsApp sandbox: manual setup

1. In Twilio Console, open **Messaging -> Try it out -> Send a WhatsApp message** and activate the sandbox.
2. From the receiving phone, send the displayed `join <sandbox-code>` to the displayed sandbox number. Use a consenting operator phone.
3. Set the five Twilio values/enable flag in the table above on **Neuro-Admin / dev**, and save. Do not share SID/token in chat. Leave `TWILIO_WHATSAPP_CONTENT_SID` unset for the sandbox test.
4. Send a message to the sandbox immediately before the acceptance test, so the 24-hour customer-service window is open. Sandbox membership expires after three days; rejoin when needed.
5. Submit one fresh Lab application after dev health is connected. Expect one email and one WhatsApp, both with only friendly Neuron name/time/inbox URL. Twilio status callbacks are supplied automatically for each message; no inbound webhook configuration is needed for this outbound-only flow.
6. Verify WhatsApp `delivered` in alert details and receipt on the phone. `provider_http_400_code_63016` generally indicates a closed service window/template requirement; check Twilio's message error details. Do not repeatedly submit applications to troubleshoot credentials.

The sandbox supports only its predefined templates outside the service window. These do not match this operational message; use the open service window for dev. See [Twilio sandbox documentation](https://www.twilio.com/docs/whatsapp/sandbox).

### Individual team distribution

Set `ID_ALERT_WHATSAPP_RECIPIENTS` as a slot-specific App Setting on Neuro-Admin dev:

```text
whatsapp:+<member-1>,whatsapp:+<member-2>,whatsapp:+<member-3>
```

Use real international E.164 numbers without spaces. Every dev recipient must join this sandbox and open their own 24-hour window. Production recipients must opt in; use the approved Content SID outside the service window. When the new setting is absent, `TWILIO_WHATSAPP_TO` remains the backward-compatible recipient. When present but empty, it does not silently fall back to the old number.

Addresses are trimmed, normalized and deduplicated. Each new alert snapshots its audience into jobs keyed `whatsapp:<SHA-256-of-recipient>`, with separate attempt IDs, message SIDs, retries, errors and callback states. Private storage contains the operator delivery address; normal APIs/UI show only its last four digits. Invalid addresses block their own jobs while valid members and email continue. Removing a member from the current list pauses that member's unsent/retry jobs. Adding/reordering members never expands historical alerts or replays accepted messages. An alert initially created with no usable audience can acquire its first audience after configuration is corrected.

V1 supports at most 20 unique team recipients to keep the jobs within Azure Table's property limit. An excessive list produces an explicit configuration error and a blocked WhatsApp placeholder, while email and inbox persistence continue; it is never silently truncated.

Each message supplies its own callback, including the recipient hash:

```text
https://dev.neuro.services/api/id-applications/notifications/twilio?id=<alert-id>&attempt=<attempt-id>&recipient=<recipient-hash>
```

No manual Sandbox Status Callback URL is required. Old callbacks without `recipient` continue to resolve their legacy job. Signatures cover the entire URL and body. A callback cannot change another member's job because both recipient key and attempt ID must match.

Live team acceptance requires at least two opted-in recipients: one fresh application, one delivery per member, and exactly one inbox alert. Automated/provider-stub tests cover isolated failure and retry; they do not count as live delivery to a second phone.

For BR acceptance, native-group research and the source rollout checklist, see [ID Neuron rollout](id-neuron-rollout.md).

### Later production sender

Register a WhatsApp sender with Twilio, obtain recipient opt-in and approve a Content Template through Content Template Builder. Use this body (approval/category is determined by Meta):

```text
New ID application
Neuron: {{1}}
Received: {{2}}
Open Neuro Admin: {{3}}
```

Supply realistic, non-sensitive examples including the full inbox URL for variable 3. Set the approved `HX...` value as `TWILIO_WHATSAPP_CONTENT_SID`, change From to the registered sender and To to the opted-in operator. The code supplies variables 1=name, 2=UTC received time, 3=full inbox URL. The alert pipeline is unchanged. [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp/api).

## Verify the second Neuron sender, read-only

Open BR's **XMPP Sniffer for the gateway's main outgoing client connection** (the Event Sink uses that client). Inspect an existing sent message to the central receiver that contains `log xmlns="urn:xmpp:eventlog"`. Read its actual `from` and remove `/resource`. If the client omits `from`, inspect the same connection's successful resource-binding IQ result `<bind xmlns="urn:ietf:params:xml:ns:xmpp-bind"><jid>...</jid></bind>`; the server assigns that bound identity to outgoing messages. The central receiving stanza's `from`, if available, is the definitive delivered sender.

Do not use an arbitrary local broker-client session or a website domain. If neither outgoing stanza nor binding result is available, the displayed connection JID remains provisional; capture the main client stream before allowlisting. No restart, new application, or receiver change is needed just to inspect an existing trace. Report only the bare JID, not payloads or authentication frames.

## Final Event Filter and onboarding steps (Lab and BR)

No authenticated Neuron browser session is available to automation in this environment, so these edits are manual. Use the same save/apply/activation procedure that fixed the existing Lab sink.

1. Open **Sources & Nodes -> Gateway configuration -> EventSinks** (Node Explorer).
2. Add **Event Filter**, Sink ID **ID Applications**, Event IDs **LegalIdRegistered** (one value, exact spelling).
3. Set each event-type threshold (Debug, Informational, Notice, Warning, Error, Critical, Alert, Emergency) to **Minor**. This admits every severity *only for the selected EventId*. Leaving thresholds at **None** blocks even a matching EventId.
4. Select that filter node and add its **child XMPP Event Sink**: Sink ID **Central ID Applications**, Recipient JID **id-alerts-lab@lab.tagroot.io**. It must be nested under the filter, not a sibling at EventSinks root.
5. Save/apply using the Neuron's proven activation procedure. Verify the persisted config has the structure below. If that build applies only at startup, perform a controlled Neuron restart in a suitable window and confirm the gateway XMPP client reconnects. Public IoTGateway source establishes startup loading, not immediate activation of every Neuron UI edit.
6. After verifying the filtered path forwards a new `LegalIdRegistered`, remove/disable the old unfiltered **ID Application Discovery** root sink. A brief overlap is deduplicated by the central application. Verify unrelated newly logged events no longer appear in outgoing XMPP to the receiver; historical discovery rows remain until retention expires.
7. For BR, verify the sender first, then append this entry to the **existing** `ID_ALERT_NEURONS` array, preserving Lab:

```json
{"id":"br-id-neuron","name":"BR ID Neuron","jid":"<verified-outgoing-bare-jid>","customerId":"br","enabled":true}
```

Save App Settings, wait for receiver health, configure BR's same filtered sink and run the acceptance test. Do not create another receiver or inbox. Do not substitute `br@sa.id.tagroot.io` until verified.

Expected XML fragment inside the existing Gateway configuration namespace (preserve all unrelated configuration):

```xml
<EventSinks>
  <EventFilter id="ID Applications" eventIds="LegalIdRegistered"
    debug="Minor" informational="Minor" notice="Minor" warning="Minor"
    error="Minor" critical="Minor" alert="Minor" emergency="Minor">
    <XmppEventSink id="Central ID Applications" jid="id-alerts-lab@lab.tagroot.io" />
  </EventFilter>
</EventSinks>
```

The [Gateway loader](https://github.com/PeterWaher/IoTGateway/blob/master/Waher.IoTGateway/Gateway.cs) parses this structure and registers top-level sinks. The [schema](https://github.com/PeterWaher/IoTGateway/blob/master/Waher.IoTGateway/Schema/GatewayConfiguration.xsd) defines the attributes. The [EventFilter implementation](https://github.com/PeterWaher/IoTGateway/blob/master/Events/Waher.Events.Filter/EventFilter.cs) requires both type/level and exact EventId to match. The sink uses the gateway main XMPP client; routing/federation to `lab.tagroot.io` must work. Existing logged events are not replayed automatically.

## Verification and release gates

Automated checks:

```powershell
npm test
npm run lint
npm run build
```

For real Azure ETag integration, securely set `TEST_ID_ALERT_STORAGE_CONNECTION_STRING` then run `node scripts/verify-id-alert-storage.mjs`. It creates a uniquely named temporary table, verifies one notification claim and one operator claim win, verifies handling preserves delivery state, and deletes the temporary table. It never calls notification providers or touches live inbox rows.

Tests cover two configured sources in one store, unknown/disabled sender rejection, noise EventIds, exact deduplication, persistence independent from diagnostics/providers, concurrent worker/operator writes, retries, ambiguous outcomes, signed callback verification, callback races, privacy and origin validation.

### Live acceptance (Lab, then BR)

1. Complete sandbox settings/join and final Neuron filter setup; health must show storage=true, lease active/connected, selected EventId and valid notification configuration.
2. Submit **one fresh** Legal ID application. Verify exactly one NEW alert, correct Neuron/customer/reference and no duplicate after delivery retry.
3. Confirm email in `ali.ouamou@trustanchorgroup.com`, WhatsApp on the opted-in phone, and provider delivery states. Verify no applicant data in either message.
4. Claim the alert; it becomes ACKNOWLEDGED, claimedBy equals `/whoami`, claimedAt exists, and NEW/ACKNOWLEDGED counts refresh. A second operator must receive conflict, not ownership.
5. After the existing manual Neuron review, the winning operator marks HANDLED. Verify handledBy/handledAt, action history and counts. Central handling does not itself approve a Legal ID.
6. Verify `LegalIdUpdated`, `IdReviewPerformed`, login/file/error logs produce no application alerts. After final sink filtering they should not be forwarded either.
7. Repeat on BR; its alert must appear in the **same** inbox as Lab with its own source/customer/reference. Source-specific alerts and actions remain independent.

A build, a mocked provider test, or provider acceptance alone does not complete this live acceptance. Until both channels are observed for a fresh Lab event and the verified second Neuron repeats the flow, V1 remains pending those manual steps.

## Git and deployment

All receiver/inbox/API/notification code is tracked. Temporary `.codex-deploy-*` folders, `release*.zip` archives and the local build log are ignored. The existing GitHub workflow builds standalone Next.js and deploys pushes to `dev` to the development slots. Only Neuro-Admin dev has this receiver enabled; staging/production receiver accounts and tables must remain separate. Check the workflow's deployment result, then shared receiver lease/connectivity and authenticated inbox health after each release.
