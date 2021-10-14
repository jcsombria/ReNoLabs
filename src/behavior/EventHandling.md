# Event Handling
Each incoming event is processed by the dispatcher, which according to the registered rules decide how the event must be handled. 
A dispatching rule consist of a unique name, and a labeling function that assign one of the supported categories. 

Currently, three labels are supported:
- ProcessImmediately: the event is immediately processed
- ProcessDeferred: the event is enqueued and will be processed later, according to the queue policy.
- Discard: the event is discarded (not processed).

