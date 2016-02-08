import sys
import urllib2
from bs4 import BeautifulSoup

hdr = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/538.1 (KHTML, like Gecko); CVUT-Cloud_Computing_Center BOT (+http://3c.felk.cvut.cz/bot/)',
       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
       'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
       'Accept-Encoding': 'none',
       'Accept-Language': 'en-US,en;q=0.8',
       'Connection': 'keep-alive'}

def intersect(a, b):
    return list(set(a) & set(b))

def union(a, b):
    return list(set(a) | set(b))

def getUrls(path):
    urls = []
    with open(path,'r') as f:
        for line in f:
            urls.append(line.strip())
    return urls

######### MAIN #########
shop_name = sys.argv[1]
urls=getUrls("../Data/"+shop_name+"/"+shop_name+"-examples.txt")
output = "../Data/"+shop_name+"/"+shop_name+"-ids.txt"

#### get IDS intersection
ids = None
for url in urls:

    # get ids of url
    html = urllib2.urlopen(urllib2.Request(url, headers=hdr)).read()
    html_ids = []
    for tag in BeautifulSoup(html).findAll(True,{'id':True}) :
        html_ids.append(tag['id'])

    # if we have no other ids, just use them
    if not ids:
        ids = html_ids
    else:
        ids = intersect(ids,html_ids);

    print len(ids)

#### save IDS

with open(output,"w") as f:
    for _id in ids:
        f.write(str(_id)+"\n")

'''
#### TEST 
print "______ TEST 1 ______"
for url in urls:
    html2 = urllib2.urlopen(urllib2.Request(url, headers=hdr)).read()
    ids2 = []
    for tag in BeautifulSoup(html2).findAll(True,{'id':True}) :
        ids2.append(tag['id'])

    len_intersect = len(intersect(ids,ids2))
    len_union = len(union(ids,ids2))

    # print "Intersect ", len_intersect
    # print "Union ", len_union
    # print "Jaccard coef to ", url," : ", (len_intersect/float(len_union))
    print "My coef to ", url," : ", (len_intersect/float(len(ids)))

print "______ TEST 2 ______"

urls = ["http://www.czc.cz/","http://www.czc.cz/graficke-karty/produkty","http://www.czc.cz/audio/produkty",
"http://www.czc.cz/rozcestnik-komponenty/clanek","http://www.czc.cz/herni-notebooky/produkty",
"http://www.czc.cz/herni-PC/produkty","http://www.alza.cz"]
for url in urls:
    html2 = urllib2.urlopen(urllib2.Request(url, headers=hdr)).read()
    ids2 = []
    for tag in BeautifulSoup(html2).findAll(True,{'id':True}) :
        ids2.append(tag['id'])

    len_intersect = len(intersect(ids,ids2))
    len_union = len(union(ids,ids2))

    print "My coef to ", url," : ", (len_intersect/float(len(ids)))
'''
