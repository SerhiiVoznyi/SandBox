# Prompt for a Task resolution

```txt
Act as Senior Software Engineer, expert in AWS and nodejs
Provide a solution for described problem  using AWS tools set.
Problem:
I have several lambda functions calling salesforce to retrieve some data,
all of them shares the same credentials to retrieve access token.

One one lambda refreshed token all other lambda with tokes became auto invalidated.
How can I share the same token between all lambdas, if one lambda issues token all should reuse it?


```
