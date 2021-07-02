import requests as rq
from bs4 import BeautifulSoup as bp

# 抓取所有sub_genres
def getGenres():
    res=rq.get("https://www.chosic.com/list-of-music-genres/",headers={
        'accept': 'application/json,text/javascript,*/*; q=0.01',
        'user-agent':'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36'
    })
    data=res.text
    soup=bp(data,'html5lib')
    mainFilter=soup.find_all('li',{'class':'genre-term-basic'})
    subFilter=soup.find_all('ul',{"class":"ul-inside"})
    i=0
    allGenres={}
    for main in mainFilter:
        main=main.text
        # 刪除備註
        if " (" in main:
            main=main.split(" (")[0]
        subSet=[]
        for sub in subFilter[i]:
            sub=sub.text
            subSet.append(sub)
        allGenres[main]=set(subSet) 
        i+=1
    return allGenres


    
 
