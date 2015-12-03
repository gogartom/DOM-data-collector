
nohup scrapy crawl website_spider  -o ../Data/"$1"/"$1"-website.json -a domain="$2" -a path_to_ids=../Data/"$1"/"$1"-ids.txt >"$1".out 2>&1 &
