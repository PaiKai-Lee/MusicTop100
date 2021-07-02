import pandas as pd
import mysql.connector
import requests as rq
import json,time
from modulepy import getGenres
import pymongo

# mydb = mysql.connector.connect(
#     host="localhost",
#     user="root",
#     password="abcd1234",
#     database="top100"
# )
# cursor = mydb.cursor()

myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb=myclient["top100"]
mycol=mydb["billboard"]

#載入全部genres
allGenres=getGenres.getGenres()

for year in range(1972,1980):
    print(year)
    songsList=[]
    genres={'main_genres':{},'sub_genres':{}}
    sub_genres=[]
    allArtists=[]
    #每年genres初始為零
    pop=danceEDM=hiphop=RnB=latin=rock=metal=country=folks=classical=jazz=blues=easyListen=newAge=world=0

    # 爬取百大單曲from wiki
    dt = pd.read_html(
        f"https://en.wikipedia.org/wiki/Billboard_Year-End_Hot_100_singles_of_{year}")
    data = dt[0]
    for i in range(len(data)):
        filter = data.iloc[i].str.replace("\"", "")
        songs ={'song':filter["Title"], 'artist':filter["Artist(s)"]}
        ##年度歌曲名單 
        songsList.append(songs)

        # 歌手姓名過濾
        artist=filter["Artist(s)"]
        artist=artist.replace("featuring",",").replace(" and",",").replace(" with",",").split(",")
        for i in artist:
            allArtists.append(i.strip())
        # spotify API 使用姓名取得genres 
        cut=0
    for singer in allArtists:
        cut+=1
        if cut%50 == 0:
            time.sleep(6)
        print(singer)
        if singer == "?":
            continue
        if " (" in singer:
            singer=singer.split(" (")[0]
        if " or " in singer:
            singer=singer.split(" or ")[0]
        if singer == "The Hillside Singers":
            continue
        if singer == "Blue Ridge Rangers":
            rock+=1
            continue
        if singer == "Sylvia Robinson":
            RnB+=1
            blues+=1
            continue
        if singer == "a Prayer Fife":
            RnB+=1
            continue
        if singer == "DeEtta Little":
            rock+=1
            continue
        if singer == "Lord David Dundas":
            pop+=1
            continue
        if singer == "Rythm Syndicate":
            RnB+=1
            blues+=1
            continue
        if singer == "Eden's Crush":
            pop+=1
            continue
        res=rq.get(f"https://api.spotify.com/v1/search?q={singer}]&type=artist&limit=1",headers={
        "Content-Type":"application/json",
        "Accept":"application/json",
        "Authorization":'Bearer {token}'.format(token="BQBrp9rKqaiPkYqV3gxrR199prLVCjv0tnsNOjujKT0BFKvtozCQLyKT19_I04fcTKf1gC53b4WikyV6fpU")
        }) 
        artist_genres=res.json()["artists"]["items"][0]["genres"]
        artist_genres=set(artist_genres)
        if artist_genres & allGenres["Pop"]:
            for i in artist_genres:
                sub_genres.append(i)
            pop+=1
        if artist_genres & allGenres['Hip-hop and Rap']:
            for i in artist_genres:
                sub_genres.append(i)
            hiphop+=1
        if artist_genres & allGenres['Dance / EDM']:
            for i in artist_genres:
                sub_genres.append(i)
            danceEDM+=1
        if artist_genres & allGenres['R&B']:
            for i in artist_genres:
                sub_genres.append(i)
            RnB+=1
        if artist_genres & allGenres['Latin']:
            for i in artist_genres:
                sub_genres.append(i)
            latin+=1
        if artist_genres & allGenres['Metal']:
            for i in artist_genres:
                sub_genres.append(i)
            metal+=1
        if artist_genres & allGenres['Rock']:
            for i in artist_genres:
                sub_genres.append(i)
            rock+=1
        if artist_genres & allGenres['Country']:
            for i in artist_genres:
                sub_genres.append(i)
            country+=1
        if artist_genres & allGenres['Folk / Acoustic']:
            for i in artist_genres:
                sub_genres.append(i)
            folks+=1
        if artist_genres & allGenres['Classical']:
            for i in artist_genres:
                sub_genres.append(i)
            classical+=1
        if artist_genres & allGenres['Jazz']:
            for i in artist_genres:
                sub_genres.append(i)
            jazz+=1
        if artist_genres & allGenres['Blues']:
            for i in artist_genres:
                sub_genres.append(i)
            blues+=1
        if artist_genres & allGenres['Easy Listening']:
            for i in artist_genres:
                sub_genres.append(i)
            easyListen+=1
        if artist_genres & allGenres['New Age']:
            for i in artist_genres:
                sub_genres.append(i)
            newAge+=1
        if artist_genres & allGenres['World / Traditional Folk']:
            for i in artist_genres:
                sub_genres.append(i)
            world+=1
        #練續爬會被禁!!! 休息    
    time.sleep(10)
    # main_genres數量
    genres["main_genres"]={
        "Pop": pop,
        "Dance/EDM":danceEDM,
        "Hip-hop/Rap":hiphop,
        "R&B":RnB,
        "Latin":latin,
        "Rock":rock,
        "Metal":metal,
        "Country":country,
        "Folk/Acoustic":folks,
        "Classical":classical,
        "Jazz":jazz,
        "Blues":blues,
        "Easy Listening":easyListen,
        "New Age":newAge,
        "World/Traditional Folk":world
        }
    # 加總各sub_genres數量
    sub_genres_count={}
    for i in sub_genres:
        sub_genres_count[i]=sub_genres.count(i)
    genres["sub_genres"]=sub_genres_count

    # # 資料庫儲存
    # val=(year,json.dumps(songsList),json.dumps(genres))
    # sql="INSERT INTO billboard (year,songs,genres) VALUES (%s,%s,%s)"
    # cursor.execute(sql,val)
    # mydb.commit()

    #MongoDB 儲存
    mycol.insert_one({"year":year,"songs":songsList,"genres":genres})

