trigger ServiceContractTrigger on ServiceContract (after insert) {
    if (Trigger.isAfter && Trigger.isInsert) {
        ServiceContractTriggerHandler.afterInsert(Trigger.new);
    }
}

