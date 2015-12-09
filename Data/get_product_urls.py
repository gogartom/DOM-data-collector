import os
import json
import sys


urls = []
added = set()

prefix = sys.argv[1]
input_file = prefix+"/"+prefix+"-website.json"
output_file = prefix+"/"+prefix+"-to-render.txt"
threshold = float(sys.argv[2])

### load urls
with open(input_file) as data_file:    
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
urls_to_crawl = []
urls_sorted = sorted(urls,key=lambda x:x[1], reverse=True)

for i in urls_sorted:
    url = i[0]
    score = i[1]

    if(score>=threshold):
        urls_to_crawl.append(url)

### save
print "writing to file",output_file,"..."
with open(output_file,'w+') as f:
    for url in urls_to_crawl:
        f.write(url+"\n")
