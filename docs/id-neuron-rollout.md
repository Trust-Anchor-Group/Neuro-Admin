# ID Neuron rollout and team notification acceptance

## Status (2026-10-01)

| Source | Verified sender | Central registration | Acceptance |
| --- | --- | --- | --- |
| Lab Neuron (`lab-neuron`, customer `lab-test`) | `lab.tagroot.io@tagroot.io` | Enabled | One NEW alert and signed email/WhatsApp delivery confirmed; latest ownership/handled check is being completed separately |
| BR ID Neuron (`br-id-neuron`, customer `br`, site `br.id.tagroot.io`) | `br@sa.id.tagroot.io` | Enabled in dev | Sender verified from main gateway sniffer `from` and publisher; waiting for filtered sink and one fresh application |

The user independently verified `br@sa.id.tagroot.io` from BR's main gateway sniffer before it was added. There is no verified inventory of every other ID Neuron in this repository; each remaining source needs the identity/mapping check below.

The dev team list contains the three user-authorized individual recipients (numbers remain in Azure App Settings). Their sandbox windows and live per-recipient deliveries must be checked before calling the three-recipient acceptance complete.

## Shortest read-only BR sender check

1. On BR, open the XMPP Sniffer for the gateway's **main outgoing client connection**, not a local broker user session.
2. Find the successful resource-binding result: `<bind xmlns="urn:ietf:params:xml:ns:xmpp-bind"><jid>...</jid></bind>`. Alternatively use `from` on an already captured outgoing Event Sink `<message>` from this same connection.
3. Copy the JID and strip `/resource`. Report only the bare JID and which record supplied it. The server's resource-binding result establishes the authenticated identity even when outbound client messages omit `from`.

If the trace does not contain either record, keep the identity unverified. Do not infer it from the website domain or a stored account label, and do not generate Legal ID applications just to discover it. Capture the main connection during its next controlled reconnect if its prior binding trace is unavailable. Do not share authentication frames or raw Legal ID payloads.

## BR acceptance sequence

BR's verified entry has been appended to the existing `ID_ALERT_NEURONS` JSON array, preserving Lab:

```json
{"id":"br-id-neuron","name":"BR ID Neuron","customerId":"br","jid":"br@sa.id.tagroot.io","enabled":true}
```

The central account remains `id-alerts-lab@lab.tagroot.io`; the table and inbox stay shared. Save the dev App Setting and wait for the central lease and XMPP connection to recover. BR's sender must have a working XMPP route to the receiver broker.

On BR configure this hierarchy, using the [exact Node Explorer steps and XML](id-application-inbox.md#final-event-filter-and-onboarding-steps-lab-and-br):

```text
EventSinks
└─ ID Applications (Event Filter: LegalIdRegistered; each type threshold Minor)
   └─ Central ID Applications (XMPP Event Sink)
      └─ Recipient: id-alerts-lab@lab.tagroot.io
```

Save and activate with the Neuron's supported procedure; restart in a controlled window if its configuration is startup-loaded. Do not retain a separate unfiltered root sink after the filtered path is verified.

Before submitting, verify receiver readiness, email configuration, and every intended WhatsApp recipient's sandbox membership/window (or production sender/template). Record the existing inbox count and the submission time with timezone. Submit **exactly one** fresh BR application.

Verify:

1. One new row in the same central inbox used by Lab.
2. `sourceNeuronId=br-id-neuron`, friendly name `BR ID Neuron`, customer `br`, verified source JID and correct Legal ID reference.
3. Exact EventId `LegalIdRegistered`; no alerts from LegalIdUpdated, IdReviewPerformed, login or error events.
4. One email and one WhatsApp per intended individual recipient; signed callbacks report delivery. Acceptance by a provider alone is not delivery confirmation.
5. Exactly one operator claims it. Status becomes ACKNOWLEDGED with correct claimedBy/claimedAt and refreshed counts; a concurrent second claim conflicts.
6. After the normal manual Neuron review, the claiming operator marks HANDLED; handledBy/handledAt and audit entries are present.
7. One row for the source/EventId/reference and one successful send per recipient. Report whether duplicate delivery was actually replayed or whether the result only shows no duplicates observed.

Do not claim BR acceptance until these live observations exist. A configured registry entry or a simulated two-source test is not the acceptance test.

## Rollout to each remaining ID Neuron

**Verify/register Neuron -> add LegalIdRegistered filter -> add child XMPP sink -> test one application.**

For each source:

1. Record stable ID, friendly name, customer mapping and verified outgoing bare JID. Keep the stable ID unchanged after rollout. Each registered source needs a unique sender JID; resolve shared sender accounts before adding them.
2. Append to the same central registry, preserving existing entries. Keep operator/debug access explicit: this team can see all registered customers.
3. Add the exact filter and child sink above to the same receiver. Confirm the main XMPP client is connected and can route to the receiver.
4. Verify readiness after config activation, then submit one application. Confirm the source's actual EventId and `ID` tag match the established classifier/reference mapping. If its format differs, inspect restricted discovery and resolve the mapping before rollout.
5. Complete all acceptance items above. Log source, timestamp, alert hash, outcome and callback status without raw applicant data. Only then move to the next source.

### Gates before broad production rollout

- BR's live multi-Neuron acceptance is still required; its sender is verified and registered.
- Three individual team recipients are configured in dev; each sandbox participant needs their own open service window. Live delivery to all three remains an acceptance check.
- Sandbox is a dev path. Register/activate a production WhatsApp sender and approved Content Template before unattended notifications outside service windows. The account inventory checked on 2026-10-01 exposed one registered sender in OFFLINE state; its production readiness was not established.
- Current embedded job storage supports up to 20 individual WhatsApp recipients per alert. There is no added limit on Neuron count, but rollout volume must fit the existing single leader, polling inbox and Table scans.
- Keep Always On, Table connectivity, sender routing and receiver health monitored. Neuron's XMPP sink may drop events while its main client is disconnected; the current transport is not a durable replay queue.
- Keep application reference tags stable. Reuse of a source ID/JID or a missing/unstable reference can undermine source attribution or deduplication.
- Uncertain provider outcomes are held for reconciliation, not blindly retried. Follow the [retry runbook](id-application-inbox.md#notifications-and-retries).

## Existing native WhatsApp groups: research, not a V1 dependency

Checked 2026-10-01 against official documentation:

- [Twilio's FAQ](https://www.twilio.com/docs/whatsapp/best-practices-and-faqs) acknowledges Meta's Groups API, but does not establish native-group access for this account. Its [Conversations example](https://www.twilio.com/code-exchange/whatsapp-group-messaging) relays individual chats through the business sender; it is not an existing native WhatsApp group.
- [Meta Groups API](https://developers.facebook.com/documentation/business-messaging/whatsapp/groups) currently requires an Official Business Account, permits eight participants, and excludes Business App/coexistence numbers and Multi-solution Conversations numbers. The current page does not state a separate 100,000-message eligibility threshold.
- Meta's [documented onboarding](https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/get-started) creates a group, then invites members. Its [management reference](https://developers.facebook.com/documentation/business-messaging/whatsapp/groups/reference) provides no documented import/join-existing-native-group operation. Existing-group reuse is therefore unverified and not a supported rollout assumption.
- The deployed integration uses the Twilio sandbox and standard Messages API with individual `whatsapp:+E164` destinations. The account's sender inventory does not expose a confirmed Groups API entitlement. Native Meta-group access through Twilio would need explicit capability/eligibility confirmation from Twilio; no private-beta entitlement is assumed.

Keep **multiple individual recipient notifications** as V1. No WhatsApp Web automation, unofficial client or group-join workaround is used. Any future Groups API evaluation must establish account eligibility, Twilio API support and whether the required group can be used before changing this pipeline.
