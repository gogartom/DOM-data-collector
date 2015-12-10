import os
import json
import sys


urls = []
added = set()

prefix = sys.argv[1]
input_file = prefix+"/"+prefix+"-website.json"
output_file = prefix+"/"+prefix+"-to-render.txt"

# We do not use threshold anymore 
#threshold = float(sys.argv[2])   

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

### We do not use threshold anymore

#for i in urls_sorted:
#    url = i[0]
#    score = i[1]
#
#    if(score>=threshold):
#        urls_to_crawl.append(url)

### save first 10000

max = min(10000,len(urls_sorted))

print "writing ",max," urls to file",output_file,"..."

with open(output_file,'w+') as f:
    for url in urls_sorted[:max]:
        f.write(url[0]+"\n")
