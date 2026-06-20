export const createAOSRequestRequiredFields = ["patient_name","patient_condition", "patient_address", "contact_number", "is_urgent"];
export const createAndEditAOSRequestAllowedFields = [...createAOSRequestRequiredFields, "relationship_to_patient", "preferred_visit_date_and_time"];
