/**
 * @description Trigger for ServiceContract object to handle various DML operations
 * @author System Administrator
 * @date 2025-10-08
 */
trigger ServiceContractTrigger on ServiceContract (after insert) {
    
    // Handle after insert events
    if (Trigger.isAfter && Trigger.isInsert) {
        ServiceContractTriggerHandler.handleAfterInsert(Trigger.new);
    }
}