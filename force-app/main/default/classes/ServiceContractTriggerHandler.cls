public with sharing class ServiceContractTriggerHandler {

    /**
     * Target status value that Quotes should be moved to when a Service Contract
     * is created from them.
     */
    public static final String TARGET_QUOTE_STATUS = 'SENT TO ERP';

    /**
     * Toggle used by tests to disable logic when the environment is not appropriately configured.
     */
    @TestVisible
    private static Boolean isDisabledForTests = false;

    /**
     * Cache of ServiceContract lookup field API names that reference Quote.
     */
    private static final Set<String> QUOTE_LOOKUP_FIELD_API_NAMES = initializeQuoteLookupFieldApiNames();

    public static void afterInsert(List<ServiceContract> newServiceContracts) {
        if (newServiceContracts == null || newServiceContracts.isEmpty()) {
            return;
        }
        if (isDisabledForTests) {
            return;
        }

        Set<Id> quoteIdsToUpdate = new Set<Id>();
        for (ServiceContract serviceContract : newServiceContracts) {
            if (serviceContract == null) {
                continue;
            }
            Id quoteId = findFirstQuoteIdFromServiceContract(serviceContract);
            if (quoteId != null) {
                quoteIdsToUpdate.add(quoteId);
            }
        }

        if (quoteIdsToUpdate.isEmpty()) {
            return;
        }

        // Avoid invalid picklist errors if the target status value does not exist.
        if (!isTargetQuoteStatusAvailable()) {
            return;
        }

        List<Quote> quotesToUpdate = [
            SELECT Id, Status
            FROM Quote
            WHERE Id IN :quoteIdsToUpdate
        ];

        if (quotesToUpdate.isEmpty()) {
            return;
        }

        for (Quote quoteRecord : quotesToUpdate) {
            if (quoteRecord.Status != TARGET_QUOTE_STATUS) {
                quoteRecord.Status = TARGET_QUOTE_STATUS;
            }
        }

        // Use partial DML to avoid failing the whole transaction for a subset of records
        // that might not support this status due to record type/value set constraints.
        Database.update(quotesToUpdate, false);
    }

    private static Id findFirstQuoteIdFromServiceContract(SObject serviceContract) {
        if (QUOTE_LOOKUP_FIELD_API_NAMES.isEmpty()) {
            return null;
        }
        for (String fieldApiName : QUOTE_LOOKUP_FIELD_API_NAMES) {
            Object value = serviceContract.get(fieldApiName);
            if (value != null) {
                return (Id) value;
            }
        }
        return null;
    }

    @TestVisible
    private static Set<String> initializeQuoteLookupFieldApiNames() {
        Set<String> apiNames = new Set<String>();
        Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.ServiceContract.fields.getMap();
        for (String fieldApiName : fieldMap.keySet()) {
            Schema.DescribeFieldResult describe = fieldMap.get(fieldApiName).getDescribe();
            if (describe.getType() == Schema.DisplayType.Reference) {
                List<Schema.SObjectType> targets = describe.getReferenceTo();
                for (Schema.SObjectType target : targets) {
                    if (target == Quote.SObjectType) {
                        apiNames.add(fieldApiName);
                        break;
                    }
                }
            }
        }
        return apiNames;
    }

    @TestVisible
    private static Boolean isTargetQuoteStatusAvailable() {
        Schema.DescribeFieldResult statusDescribe = Quote.Status.getDescribe();
        for (Schema.PicklistEntry entry : statusDescribe.getPicklistValues()) {
            if (entry.isActive() && entry.getValue() == TARGET_QUOTE_STATUS) {
                return true;
            }
        }
        return false;
    }
}

