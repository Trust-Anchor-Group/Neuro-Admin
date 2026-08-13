# Parklet Super Admin review – QA

## Scope and architecture

The Parklet card on `/landingpage` opens the isolated Parklet admin area. The established Neuro Admin dashboard layout, menu, route guard, configured Neuron host, and server-held Neuron session are reused. Browser calls go only to fixed same-origin BFF routes. The BFF resolves the host through the existing `resolveAgentHost`/`AGENT_HOST` convention and forwards only the server-held `HttpSessionID` cookie. No JWT, credential, or script path is exposed to the Parklet client.

The implementation uses direct, controlled Neuron scripts for mutations. It does not yet use future Parklet backend admin mutation endpoints, and it does not change `TAG.Service.Parklet` or any `.ws` script.

All list and detail reads use `cache: no-store` and the real `/parklet-admin-api` endpoints. Status is filtered upstream, not in React.

## Routes and fixed mappings

| Review operation | Browser BFF | Fixed Neuron script | Exact payload |
| --- | --- | --- | --- |
| Approve organization | `POST /api/admin/organizations/{id}/approve` | `/ParkletAdmin/activateOrg.ws` | `{ "organizationId": "<uuid>" }` |
| Deny organization | `POST /api/admin/organizations/{id}/deny` | `/ParkletAdmin/denyOrg.ws` | `{ "organizationId": "<uuid>", "reason": "<required>" }` |
| Reactivate organization | `POST /api/admin/organizations/{id}/reactivate` | `/ParkletAdmin/reactivate.ws` | `{ "organizationId": "<uuid>", "reason": "<required>" }` |
| Approve parking | `POST /api/admin/parking-areas/{id}/approve` | `/ParkletAdmin/parkingApprove.ws` | `{ "parkingAreaId": "<uuid>" }` |
| Reject parking | `POST /api/admin/parking-areas/{id}/reject` | `/ParkletAdmin/parkingReject.ws` | `{ "parkingAreaId": "<uuid>", "reason": "<required>" }` |

There is no generic run-script endpoint. Each route validates JSON content type, body size, UUID/path equality, the exact field allowlist, and any required non-empty reason before calling its one compiled-in operation.

## Organization review

Open `/parklet`.

Tabs and real reads:

- Väntar på granskning → `GET /api/admin/organizations?status=Pending`
- Aktiva → `GET /api/admin/organizations?status=Active`
- Nekade → `GET /api/admin/organizations?status=Denied`
- Inaktiverade → `GET /api/admin/organizations?status=Deactivated`
- Detail → `GET /api/admin/organizations/{id}`

Manual real-call sequence:

1. Select a real Pending organization and open **Granska**.
2. Select **Godkänn organisation**, inspect the confirmation, and select **Avbryt**. Confirm that DevTools shows no POST.
3. Open the confirmation again and confirm once. Verify one POST to the approve BFF, followed by fresh Pending, Active, and detail GETs.
4. Verify that persisted detail is Active, the row is absent from Pending, and it appears in Active.
5. Select another real Pending organization, select **Neka organisation**, and confirm the button is disabled for an empty/whitespace reason.
6. Enter a reason and confirm once. Verify one deny POST followed by fresh Pending, Denied, and detail GETs. Verify the persisted Denied status.
7. Open that organization under Nekade, select **Återaktivera organisation**, enter a reason, and confirm once.
8. Verify one reactivate POST followed by fresh Denied, Active, and detail GETs. Verify persisted Active status.
9. If real Deactivated data exists, repeat reactivation there and verify fresh Deactivated, Active, and detail reads.

Expected transitions:

- Pending → Active via approve
- Pending → Denied via deny
- Denied → Active via reactivate
- Deactivated → Active via reactivate

Active organizations have no approval action. Reactivate is not shown for Pending.

## Parking review

Open `/parklet/parkeringar`.

Tabs and real reads:

- Väntar på granskning → `GET /api/admin/parking-areas?status=Pending`
- Godkända → `GET /api/admin/parking-areas?status=Approved`
- Nekade → `GET /api/admin/parking-areas?status=Rejected`
- Detail → `GET /api/admin/parking-areas/{id}`

Manual real-call sequence:

1. Select a real Pending parking area and open **Granska**.
2. Verify address, status, mode, visibility, capacity, safe access-requirement booleans, geometry, photos, and Enumerated Squares when returned. Confirm there are no Square action buttons.
3. Select **Godkänn parkering**, cancel once, then confirm once.
4. Verify one approve POST followed by fresh Pending, Approved, and detail GETs. Verify persisted Approved status, absence from Pending, and presence under Godkända.
5. Select another real Pending area, choose **Neka parkering**, and confirm an empty reason cannot be submitted.
6. Enter a reason and confirm once. Verify one reject POST followed by fresh Pending, Rejected, and detail GETs. Verify persisted Rejected status and presence under Nekade.

Approved and Rejected areas have no ordinary approve/reject actions in this version.

## Error and concurrency checks

- Double-click confirmation and verify only one mutation request is sent.
- A 401 uses the existing administrator session flow/message.
- A 403 displays `Du har inte behörighet att utföra den här åtgärden.` Neuron remains authoritative; the browser does not hardcode an Administrator role check.
- A safe 400 validation/current-state message may be shown.
- For a network/502 unknown result, verify the UI says it cannot confirm the change, sends no automatic retry, and performs fresh reads. The UI must render only the persisted status returned by those reads.
- Inspect request bodies and confirm they contain only the documented business fields.
- Inspect browser storage and network data and confirm no Neuron JWT, `Authorization` header, admin credential, or `.ws` selector is exposed.

## Safe testing and rollback

Automated tests do not call real scripts. Real mutations must be run manually against deliberately selected review records. Record the IDs and reasons before testing. There is no general rollback control: use only the supported business transition available for the current status (for example Denied → Active through Reactivate), or coordinate with the Parklet owner for any unsupported correction. Do not edit backend data or scripts as a rollback shortcut.
