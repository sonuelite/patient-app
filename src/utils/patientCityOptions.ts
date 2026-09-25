export type PatientCityOption = { id: string; name: string };

// Field names confirmed by the getcitybystateid response.
export function normalizePatientCities(response: unknown): PatientCityOption[] {
  const data = Array.isArray(response)
    ? response
    : response && typeof response === 'object' && 'data' in response
    ? response.data
    : null;
  if (!Array.isArray(data)) {
    throw new Error('Invalid cities response');
  }
  const options = data.flatMap((item: unknown): PatientCityOption[] => {
    if (!item || typeof item !== 'object') {
      return [];
    }
    const row = item as Record<string, unknown>;
    const id = row.city_id;
    const name = row.city_name;
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
    throw new Error('City IDs and names are missing from the response');
  }
  return options;
}
