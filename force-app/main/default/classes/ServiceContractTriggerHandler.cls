/**
 * @description Handler class for ServiceContract trigger operations
 * @author System Administrator
 * @date 2025-10-08
 */
public with sharing class ServiceContractTriggerHandler {
    
    // Constant for Quote status
    private static final String QUOTE_STATUS_SENT_TO_ERP = 'SENT TO ERP';
    
    /**
     * @description Handles after insert trigger events for Service Contracts
     * @param newServiceContracts List of newly inserted Service Contract records
     */
    public static void handleAfterInsert(List<ServiceContract> newServiceContracts) {
        updateQuoteStatusForNewContracts(newServiceContracts);
    }
    
    /**
     * @description Updates the status of related Quotes to 'SENT TO ERP' when Service Contracts are created
     * @param serviceContracts List of Service Contract records
     */
    private static void updateQuoteStatusForNewContracts(List<ServiceContract> serviceContracts) {
        try {
            // Collect all Quote IDs from Service Contracts
            Set<Id> quoteIds = new Set<Id>();
            
            for (ServiceContract contract : serviceContracts) {
                // Check if the Service Contract has a related Quote
                // Assuming there's a custom field called Quote__c on ServiceContract
                // If the field name is different in your org, please adjust accordingly
                if (contract.Quote__c != null) {
                    quoteIds.add(contract.Quote__c);
                }
            }
            
            // If there are no related quotes, exit early
            if (quoteIds.isEmpty()) {
                return;
            }
            
            // Query the related Quotes
            List<Quote> quotesToUpdate = [
                SELECT Id, Status 
                FROM Quote 
                WHERE Id IN :quoteIds
                AND Status != :QUOTE_STATUS_SENT_TO_ERP
            ];
            
            // Update the Quote status
            for (Quote quote : quotesToUpdate) {
                quote.Status = QUOTE_STATUS_SENT_TO_ERP;
            }
            
            // Perform DML update if there are quotes to update
            if (!quotesToUpdate.isEmpty()) {
                update quotesToUpdate;
                
                // Log successful update
                System.debug('Successfully updated ' + quotesToUpdate.size() + ' Quote(s) to status: ' + QUOTE_STATUS_SENT_TO_ERP);
            }
            
        } catch (DmlException e) {
            // Handle DML exceptions
            System.debug('Error updating Quote status: ' + e.getMessage());
            
            // Add error to the Service Contract records to notify users
            for (ServiceContract contract : serviceContracts) {
                contract.addError('Failed to update related Quote status: ' + e.getMessage());
            }
        } catch (Exception e) {
            // Handle any other exceptions
            System.debug('Unexpected error in updateQuoteStatusForNewContracts: ' + e.getMessage());
            
            // Add error to the Service Contract records
            for (ServiceContract contract : serviceContracts) {
                contract.addError('An unexpected error occurred while updating Quote status: ' + e.getMessage());
            }
        }
    }
    
    /**
     * @description Alternative method if Service Contract is related to Quote through Opportunity
     * This method assumes: Quote -> Opportunity -> Service Contract relationship
     * @param serviceContracts List of Service Contract records
     */
    public static void updateQuoteStatusViaOpportunity(List<ServiceContract> serviceContracts) {
        try {
            // Collect all Account IDs from Service Contracts
            Set<Id> accountIds = new Set<Id>();
            
            for (ServiceContract contract : serviceContracts) {
                if (contract.AccountId != null) {
                    accountIds.add(contract.AccountId);
                }
            }
            
            if (accountIds.isEmpty()) {
                return;
            }
            
            // Query related Opportunities and their Quotes
            List<Opportunity> opportunities = [
                SELECT Id, AccountId,
                    (SELECT Id, Status FROM Quotes WHERE Status != :QUOTE_STATUS_SENT_TO_ERP)
                FROM Opportunity
                WHERE AccountId IN :accountIds
                AND IsClosed = false
            ];
            
            List<Quote> quotesToUpdate = new List<Quote>();
            
            // Collect all quotes that need to be updated
            for (Opportunity opp : opportunities) {
                for (Quote quote : opp.Quotes) {
                    quote.Status = QUOTE_STATUS_SENT_TO_ERP;
                    quotesToUpdate.add(quote);
                }
            }
            
            // Update quotes if any found
            if (!quotesToUpdate.isEmpty()) {
                update quotesToUpdate;
                System.debug('Successfully updated ' + quotesToUpdate.size() + ' Quote(s) via Opportunity relationship');
            }
            
        } catch (Exception e) {
            System.debug('Error in updateQuoteStatusViaOpportunity: ' + e.getMessage());
            
            for (ServiceContract contract : serviceContracts) {
                contract.addError('Failed to update related Quote status via Opportunity: ' + e.getMessage());
            }
        }
    }
}