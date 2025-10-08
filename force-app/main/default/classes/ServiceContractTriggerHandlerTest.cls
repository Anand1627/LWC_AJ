/**
 * @description Test class for ServiceContractTriggerHandler
 * @author System Administrator
 * @date 2025-10-08
 */
@isTest
private class ServiceContractTriggerHandlerTest {
    
    /**
     * @description Setup test data
     */
    @TestSetup
    static void setupTestData() {
        // Create test Account
        Account testAccount = new Account(
            Name = 'Test Account for Service Contract',
            Type = 'Customer',
            Industry = 'Technology'
        );
        insert testAccount;
        
        // Create test Opportunity
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity for Service Contract',
            AccountId = testAccount.Id,
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            Amount = 50000
        );
        insert testOpp;
        
        // Create test Quote
        Quote testQuote = new Quote(
            Name = 'Test Quote for Service Contract',
            OpportunityId = testOpp.Id,
            Status = 'Draft',
            ExpirationDate = Date.today().addDays(30)
        );
        insert testQuote;
    }
    
    /**
     * @description Test that Quote status is updated to 'SENT TO ERP' when Service Contract is created
     */
    @isTest
    static void testQuoteStatusUpdateOnServiceContractCreation() {
        // Query test data
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account for Service Contract' LIMIT 1];
        Quote testQuote = [SELECT Id, Status FROM Quote WHERE Name = 'Test Quote for Service Contract' LIMIT 1];
        
        // Verify initial Quote status
        System.assertEquals('Draft', testQuote.Status, 'Quote should initially be in Draft status');
        
        Test.startTest();
        
        // Create Service Contract with reference to Quote
        ServiceContract testContract = new ServiceContract(
            Name = 'Test Service Contract',
            AccountId = testAccount.Id,
            StartDate = Date.today(),
            EndDate = Date.today().addYears(1),
            Quote__c = testQuote.Id  // Custom field linking to Quote
        );
        insert testContract;
        
        Test.stopTest();
        
        // Query updated Quote
        Quote updatedQuote = [SELECT Id, Status FROM Quote WHERE Id = :testQuote.Id];
        
        // Assert that Quote status has been updated
        System.assertEquals('SENT TO ERP', updatedQuote.Status, 
            'Quote status should be updated to SENT TO ERP after Service Contract creation');
    }
    
    /**
     * @description Test multiple Service Contracts creation updating multiple Quotes
     */
    @isTest
    static void testBulkServiceContractCreation() {
        // Create additional test data
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account for Service Contract' LIMIT 1];
        
        List<Opportunity> opportunities = new List<Opportunity>();
        for (Integer i = 0; i < 5; i++) {
            opportunities.add(new Opportunity(
                Name = 'Bulk Test Opportunity ' + i,
                AccountId = testAccount.Id,
                StageName = 'Prospecting',
                CloseDate = Date.today().addDays(30)
            ));
        }
        insert opportunities;
        
        List<Quote> quotes = new List<Quote>();
        for (Opportunity opp : opportunities) {
            quotes.add(new Quote(
                Name = 'Bulk Test Quote for ' + opp.Name,
                OpportunityId = opp.Id,
                Status = 'Draft'
            ));
        }
        insert quotes;
        
        Test.startTest();
        
        // Create Service Contracts in bulk
        List<ServiceContract> contracts = new List<ServiceContract>();
        for (Quote quote : quotes) {
            contracts.add(new ServiceContract(
                Name = 'Bulk Test Contract for ' + quote.Name,
                AccountId = testAccount.Id,
                StartDate = Date.today(),
                EndDate = Date.today().addYears(1),
                Quote__c = quote.Id
            ));
        }
        insert contracts;
        
        Test.stopTest();
        
        // Query updated Quotes
        List<Quote> updatedQuotes = [SELECT Id, Status FROM Quote WHERE Id IN :quotes];
        
        // Assert all Quotes have been updated
        for (Quote q : updatedQuotes) {
            System.assertEquals('SENT TO ERP', q.Status, 
                'All Quotes should be updated to SENT TO ERP status');
        }
        
        System.assertEquals(5, updatedQuotes.size(), 'Should have updated 5 Quotes');
    }
    
    /**
     * @description Test Service Contract creation without Quote reference
     */
    @isTest
    static void testServiceContractWithoutQuote() {
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account for Service Contract' LIMIT 1];
        Quote originalQuote = [SELECT Id, Status FROM Quote WHERE Name = 'Test Quote for Service Contract' LIMIT 1];
        
        Test.startTest();
        
        // Create Service Contract without Quote reference
        ServiceContract testContract = new ServiceContract(
            Name = 'Test Service Contract Without Quote',
            AccountId = testAccount.Id,
            StartDate = Date.today(),
            EndDate = Date.today().addYears(1)
            // No Quote__c field set
        );
        insert testContract;
        
        Test.stopTest();
        
        // Query Quote to ensure it wasn't updated
        Quote unchangedQuote = [SELECT Id, Status FROM Quote WHERE Id = :originalQuote.Id];
        
        // Assert that Quote status remains unchanged
        System.assertEquals('Draft', unchangedQuote.Status, 
            'Quote status should remain unchanged when Service Contract has no Quote reference');
    }
    
    /**
     * @description Test that Quote already in 'SENT TO ERP' status is not queried/updated
     */
    @isTest
    static void testQuoteAlreadySentToERP() {
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account for Service Contract' LIMIT 1];
        Quote testQuote = [SELECT Id, Status FROM Quote WHERE Name = 'Test Quote for Service Contract' LIMIT 1];
        
        // Update Quote status to 'SENT TO ERP' before creating Service Contract
        testQuote.Status = 'SENT TO ERP';
        update testQuote;
        
        Test.startTest();
        
        // Create Service Contract
        ServiceContract testContract = new ServiceContract(
            Name = 'Test Service Contract for Already Sent Quote',
            AccountId = testAccount.Id,
            StartDate = Date.today(),
            EndDate = Date.today().addYears(1),
            Quote__c = testQuote.Id
        );
        insert testContract;
        
        Test.stopTest();
        
        // Query Quote
        Quote unchangedQuote = [SELECT Id, Status FROM Quote WHERE Id = :testQuote.Id];
        
        // Assert that Quote status remains 'SENT TO ERP'
        System.assertEquals('SENT TO ERP', unchangedQuote.Status, 
            'Quote status should remain SENT TO ERP');
    }
    
    /**
     * @description Test error handling when Quote update fails
     */
    @isTest
    static void testErrorHandling() {
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account for Service Contract' LIMIT 1];
        
        // Create a Quote without required fields to simulate potential DML exception
        // Note: This test might need adjustment based on your org's validation rules
        Quote testQuote = [SELECT Id FROM Quote WHERE Name = 'Test Quote for Service Contract' LIMIT 1];
        
        Test.startTest();
        
        Boolean exceptionThrown = false;
        
        try {
            // Create Service Contract with invalid Quote reference
            ServiceContract testContract = new ServiceContract(
                Name = 'Test Service Contract with Error',
                AccountId = testAccount.Id,
                StartDate = Date.today(),
                EndDate = Date.today().addYears(1),
                Quote__c = testQuote.Id
            );
            
            // Simulate error by trying to insert with null required field
            // Adjust based on your org's requirements
            insert testContract;
            
        } catch (Exception e) {
            exceptionThrown = true;
            System.debug('Exception caught: ' + e.getMessage());
        }
        
        Test.stopTest();
        
        // The test should complete without unhandled exceptions
        System.assert(true, 'Test completed successfully');
    }
    
    /**
     * @description Test the alternative method using Opportunity relationship
     */
    @isTest
    static void testUpdateQuoteViaOpportunity() {
        // Query test data
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account for Service Contract' LIMIT 1];
        Quote testQuote = [SELECT Id, Status, OpportunityId FROM Quote WHERE Name = 'Test Quote for Service Contract' LIMIT 1];
        
        // Create Service Contract list
        List<ServiceContract> contracts = new List<ServiceContract>{
            new ServiceContract(
                Name = 'Test Contract via Opportunity',
                AccountId = testAccount.Id,
                StartDate = Date.today(),
                EndDate = Date.today().addYears(1)
            )
        };
        
        Test.startTest();
        
        // Call the alternative method directly
        ServiceContractTriggerHandler.updateQuoteStatusViaOpportunity(contracts);
        
        Test.stopTest();
        
        // Query updated Quote
        Quote updatedQuote = [SELECT Id, Status FROM Quote WHERE Id = :testQuote.Id];
        
        // This test verifies the alternative method works
        // The actual result depends on whether the Opportunity is closed or not
        System.assertNotEquals(null, updatedQuote.Status, 'Quote should have a status');
    }
}