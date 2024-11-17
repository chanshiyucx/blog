
```dataview
table date as "Date", level as "Level", split(tags, "/")[1] as "Tags" 
from "Leetcode"
where file.name != "SUMMARY"
sort date asc
```
