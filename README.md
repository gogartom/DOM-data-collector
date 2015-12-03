# DOM-data-collector


## STEP BY STEP CRAWLING
- add folder with examples to Data
- get ids by running "cd Scripts; python get_ids_for_examples.py $SHOP_PREFIX"
- run crawler by "cd Crawler; ./run.sh obchod-boty obchod-boty.cz"
- get urls to render by "cd Data; python get_product_urls.py snowbitch/snowbitch-website.json $THRESHOLD"
- run render by "cd Renderer; ./run.sh $SHOP_PREFIX"

## EASIER CRAWLING
- TODO

## TODO:
- move script "cd data; python get_product_urls.py snowbitch/snowbitch-website.json 0.6" to scripts
- this is bad: "python get_product_urls.py snowbitch/snowbitch-website.json 0.6 > snowbitch/snowbitch-to-render.txt"
