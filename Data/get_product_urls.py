import os
import json
import sys


urls = []
added = set()

input_file = sys.argv[1]
threshold = float(sys.argv[2])

### load urls
with open(sys.argv[1]) as data_file:    
    for line in data_file:
        try:
            s = line.strip().replace('[','')[:-1]
            data = json.loads(s)
            url = data["url"]
            score = float(data["intersection"])+float(data["jacard_distance"])
            
            if url not in added:
                urls.append((url,score))
                added.add(url) 
        except:
            pass


### sort
urls_sorted = sorted(urls,key=lambda x:x[1], reverse=True)

for i in urls_sorted:
    url = i[0]
    score = i[1]

    if(score>=threshold):
        print url
