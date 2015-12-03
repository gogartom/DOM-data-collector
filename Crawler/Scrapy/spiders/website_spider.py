import scrapy
from Scrapy.items import PageItem

from scrapy.contrib.spiders import CrawlSpider, Rule
from scrapy.contrib.linkextractors import LinkExtractor
# from scrapy.contrib.linkextractors.sgml import SgmlLinkExtractor


class WebsiteSpider(CrawlSpider):
    name = "website_spider"
    ids = []

    # start_urls = ["http://www.czc.cz"];
    

    # rules =(Rule(LinkExtractor(allow=(),allow_domains="czc.cz") ,callback = 'parse_item', follow=True),)
   

    # def __init__(self, path_to_ids, domain):
        # self.allowed_domains = "czc.cz";
        # self.start_urls = ["http://www.czc.cz"];
        # self.loadIds(path_to_ids)

    def __init__(self, *a, **kw):
        self.rules =(Rule(LinkExtractor(allow=(),allow_domains=kw["domain"]) ,callback = 'parse_item', follow=True),)
        self.start_urls = ["http://www."+kw["domain"]];
        self.loadIds(kw["path_to_ids"])

        super(WebsiteSpider, self).__init__(*a, **kw)


    def loadIds(self, path_to_ids):
        with  open(path_to_ids,"r") as f:
            for line in f:
                self.ids.append(line.strip())

    def intersect(self, a, b):
        return list(set(a) & set(b))

    def union(self, a, b):
        return list(set(a) | set(b))

    def parse_item(self, response):
        print response.url

        item = PageItem()

        # get ids
        url_ids = response.xpath('//*[string-length(@id) >0]').xpath('@id').extract();

        # compute intersection and union
        len_intersect = len(self.intersect(self.ids,url_ids))
        len_union = len(self.union(self.ids,url_ids))

        item['url'] = response.url
        item['jacard_distance'] = len_intersect/float(len_union)
        item['intersection'] = len_intersect/float(len(self.ids))

        return item