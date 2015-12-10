# DOM-data-collector


## STEP BY STEP CRAWLING
- add folder with examples to Data
- get ids by running "cd Scripts; python get_ids_for_examples.py $SHOP_PREFIX"
- run crawler by "cd Crawler; ./run.sh $SHOP_PREFIX " (for non .cz domains, script need to be changed)
- get urls to render by "cd Data; python get_product_urls.py $SHOP_PREFIX"
- run render by "cd Renderer; ./run.sh $SHOP_PREFIX"


## EASIER CRAWLING
- TODO

## TODO:
- move script "cd data; python get_product_urls.py snowbitch 0.6" to scripts
