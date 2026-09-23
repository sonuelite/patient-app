# Patient authentication

Redux Toolkit owns authentication. AppContext retains only the existing clinical/demo data and clinical profile selection; it does not own a token, authenticated user, login flag, restoration state, or logout action.

## Files

- `src/types/auth.ts`: patient/session types, runtime validation, entity ID extraction.
- `src/store/authSlice.ts`: login persistence, startup restoration, entity selection, logout.
- `src/store/index.ts`, `hooks.ts`, `selectors.ts`: configured store and typed access.
- `src/utils/sessionStorage.ts`: AsyncStorage snapshot under `patient_session`.
- `src/network/client.ts`: public client and authenticated client with request interceptor.
- `src/network/api.ts`: existing public authentication API calls.

The snapshot contains `accessToken`, `patient`, and `selectedEntityId`. `patient` contains all returned identity fields, `entityList`, and `financeList`. Tokens are not copied into the patient object. API-only `success` and `message` fields are not persisted.

## Read the session in a component

```tsx
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  selectAccessToken,
  selectPatient,
  selectPatientId,
  selectEntityId,
} from '../store/selectors';
import {selectEntity} from '../store/authSlice';

// Inside a component:
const dispatch = useAppDispatch();
const accessToken = useAppSelector(selectAccessToken);
const patient = useAppSelector(selectPatient);
const patient_id = useAppSelector(selectPatientId);
const entityId = useAppSelector(selectEntityId);

// Inside an event handler, using an ID from the patient's entityList:
await dispatch(selectEntity(nextEntityId)).unwrap();
```

`selectPatientId` derives the authenticated patient's numeric `patient_id`; it does not use the demo family-profile ID from AppContext. Entity selection is validated against the patient's entity list and persisted before Redux changes, so a failed write preserves the previous selection.

## Authenticated requests

```ts
import {apiClient} from '../network/api';
import {store} from '../store';
import {selectPatientId} from '../store/selectors';

async function fetchPatientResource(resourcePath: string) {
  const patient_id = selectPatientId(store.getState());
  if (patient_id === null) {
    throw new Error('Please sign in first');
  }
  const response = await apiClient.get<unknown>(resourcePath, {
    params: {patient_id},
  });
  return response.data;
}
```

The interceptor reads Redux for each request and sets `Authorization: Bearer <accessToken>` and `x-entity-id` when available. It removes stale session headers when signed out. Pass `patient_id` in the body/query required by each endpoint; no undocumented patient header is invented.

Use `publicClient` only for public endpoints. Sign-in, phone verification, OTP verification, and registration use this client and do not inherit another account's credentials.

## Entity schema and registration

The supplied response did not include the contents of `entityList`. Until its exact schema is supplied, `getEntityId` accepts `entity_id`, `entityId`, or `id` and normalizes numeric IDs to strings. Login initially selects the first identifiable returned entity. An empty/unrecognized list leaves the selection `null`, so no entity header is guessed. Refine this helper when the actual schema is available.

Registration previously hardcoded `x-entity-id: 1`. It now accepts an optional explicit ID: `registerPatient(patientData, entityId)`. The current Signup caller does not supply an ID. If the server requires one before login, supply it from tenant configuration or an existing selection flow; the application has no such source at present. The signup UI has not been changed.

## Startup, OTP, and logout

StackNavigator dispatches restoration once and shows its existing loading indicator until Redux is hydrated. It reads Redux `isLoggedIn` for routing. A valid token and complete patient details are required for both password and OTP login. An OTP response with only `success: true` or only a token does not authenticate; the backend must return the patient payload as well. No profile-fetch endpoint was invented.

Logout removes only authentication storage, then clears Redux authentication. Unrelated preferences remain. The root clinical provider is remounted when the authenticated account changes, clearing its local profile selection and existing in-memory demo changes.

Old token-only sessions cannot reconstruct the patient identity and require one fresh login. Invalid snapshots are removed. Storage failures surface as errors instead of reporting a successful login/logout. Token expiry and server-side revocation remain backend concerns; this change does not add a refresh-token flow.

AsyncStorage is used as explicitly requested. No Expo/native storage packages were added. Existing clinical screens and their mock datasets remain outside this migration.

## Reference documentation

- [Redux Toolkit TypeScript](https://redux-toolkit.js.org/usage/usage-with-typescript)
- [React Redux typed hooks](https://react-redux.js.org/using-react-redux/usage-with-typescript)
- [Axios interceptors](https://axios-http.com/docs/interceptors)
