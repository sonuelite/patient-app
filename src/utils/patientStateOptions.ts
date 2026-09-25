export type PatientStateOption = { id: string; name: string };

// Field names confirmed by the getstatesbycountryid response.
export function normalizePatientStates(
  response: unknown,
): PatientStateOption[] {
  const data = Array.isArray(response)
    ? response
    : response && typeof response === 'object' && 'data' in response
    ? response.data
    : null;

  if (!Array.isArray(data)) {
    throw new Error('Invalid states response');
  }

  const options = data.flatMap((item: unknown): PatientStateOption[] => {
    if (!item || typeof item !== 'object') {
      return [];
    }
    const row = item as Record<string, unknown>;
    const id = row.states_id;
    const name = row.states_name;
    if (
      (typeof id !== 'string' && typeof id !== 'number') ||
      !String(id).trim() ||
      typeof name !== 'string' ||
      !name.trim()
    ) {
      return [];
    }
    return [{ id: String(id), name: name.trim() }];
  });

  if (data.length > 0 && options.length === 0) {
    throw new Error('State IDs and names are missing from the response');
  }
  return options;
}
