import urllib.request
import urllib.parse
import json
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from concurrent.futures import ThreadPoolExecutor
from django.utils import timezone
from api.models.news_item import NewsItem

def translate_text(text):
    if not text or len(text.strip()) == 0:
        return ""
    try:
        url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=" + urllib.parse.quote(text)
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
        translated_text = "".join([segment[0] for segment in data[0] if segment[0]])
        return translated_text
    except Exception as e:
        print(f"Translation failed for text: {e}")
        return text

def fetch_and_cache_news(limit=30):
    url = "https://www.vogue.com/feed/rss"
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            rss_data = response.read()
            
        root = ET.fromstring(rss_data)
        
        items_to_translate = []
        
        for item in root.findall('.//item'):
            if len(items_to_translate) >= limit:
                break
                
            link = item.find('link')
            link_text = link.text if link is not None else ''
            if not link_text:
                continue
                
            # Check if this link is already in database
            if NewsItem.objects.filter(link=link_text).exists():
                continue
                
            title = item.find('title')
            description = item.find('description')
            pub_date = item.find('pubDate')
            creator = item.find('{http://purl.org/dc/elements/1.1/}creator')
            
            image_url = ""
            media_thumbnail = item.find('{http://search.yahoo.com/mrss/}thumbnail')
            if media_thumbnail is not None:
                image_url = media_thumbnail.get('url', '')
            if not image_url:
                media_content = item.find('{http://search.yahoo.com/mrss/}content')
                if media_content is not None:
                    image_url = media_content.get('url', '')
            if not image_url:
                enclosure = item.find('enclosure')
                if enclosure is not None and 'image' in enclosure.get('type', ''):
                    image_url = enclosure.get('url', '')
                    
            pub_date_str = pub_date.text if pub_date is not None else ''
            pub_date_parsed = None
            if pub_date_str:
                try:
                    pub_date_parsed = parsedate_to_datetime(pub_date_str)
                except Exception:
                    pass

            items_to_translate.append({
                'title': title.text if title is not None else '',
                'link': link_text,
                'description': description.text if description is not None else '',
                'pubDate': pub_date_str,
                'pub_date_parsed': pub_date_parsed,
                'creator': creator.text if creator is not None else 'Vogue',
                'image': image_url
            })
            
        if not items_to_translate:
            print("[News Service] No new news items found in RSS feed.")
            return 0
            
        # Perform concurrent translation only for NEW items
        titles = [item['title'] for item in items_to_translate]
        descriptions = [item['description'] for item in items_to_translate]
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            translated_titles = list(executor.map(translate_text, titles))
            translated_descriptions = list(executor.map(translate_text, descriptions))
            
        # Save to database
        saved_count = 0
        for idx, item in enumerate(items_to_translate):
            try:
                NewsItem.objects.create(
                    title=translated_titles[idx],
                    link=item['link'],
                    description=translated_descriptions[idx],
                    pub_date=item['pubDate'],
                    pub_date_parsed=item['pub_date_parsed'],
                    creator=item['creator'],
                    image=item['image']
                )
                saved_count += 1
            except Exception as e:
                print(f"Error saving NewsItem: {e}")
                
        print(f"[News Service] Successfully cached {saved_count} new fashion news items.")
        return saved_count
    except Exception as e:
        print(f"[News Service] Error in fetch_and_cache_news: {e}")
        return 0
