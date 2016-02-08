# -*- coding: utf-8 -*- 
import sys
import re
import json
import cv2
import numpy as np
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import HashingVectorizer


def preprocess_string(text):
    res = re.sub("\d+", "^number^", text)
    return res
    
if __name__ == "__main__":
    # get results
    result_file = sys.argv[1]

    #features count
    n_features = 128

    # get vectorizer
    vectorizer = HashingVectorizer(n_features=n_features, non_negative=True, preprocessor=preprocess_string)    #analyzer='char', ngram_range=(2,2) 

    with open(result_file,'r') as f:
        for line in f.readlines():
            name = line.strip()

            # open annotations
            with open('pokus_annotations/'+name+'.json','r') as f:
                page = json.load(f)
                boxes = page['textBB']
                print page['url']


            # load image
            im = cv2.imread('pokus_images/'+name+'.jpeg')
            # im = im[:1000,:,:]
            im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
            # im = np.ones((im.shape[0],im.shape[1],3),dtype=np.float)

            # feature matrix
            # features = np.zeros((im.shape[0],im.shape[1],n_features),dtype=np.float)
            
            # plot boxes
            plt.figure()
            plt.imshow(im)
            i = 0
            for box in boxes:
                i+=1
                print i
                bb = box['boundingBox']
                text = box['text']

                # get encoded vector
                # encoded_text = vectorizer.transform([text])
                # vector = np.asarray(encoded_text.todense())[0]

                # save to features
                # features[bb[1]:bb[3],bb[0]:bb[2],:] = vector

                # get image
                if len(text)>20:
                    text = text[:20]+'...'
                plt.gca().add_patch(plt.Rectangle((bb[0], bb[1]), bb[2] - bb[0],
                        bb[3] - bb[1], fill=False,
                            edgecolor='g', linewidth=1)
                )

                # plt.text(bb[0], bb[1]-7,text,fontsize='8',color='g')

            # plt.show()
            plt.savefig('ukazky/'+name+'.jpg')

            # plot features
            # for i in range(128):
            #     plt.figure()
            #     plt.imshow(features[:,:,i])
            #     # plt.show()
            #     plt.savefig('ukazky/'+str(i)+'.jpg')
            # 
