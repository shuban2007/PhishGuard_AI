def extract_features(url: str):
    url = str(url).lower()
    return [
        len(url),
        url.count('.'),
        url.count('-'),
        url.count('@'),
        int('https' in url),
        int('login' in url),
        int('secure' in url),
        int('verify' in url),
        int('account' in url),
        int('update' in url),
        int('free' in url),
        int('bonus' in url),
        int('win' in url),
        int(url.startswith("https://")),
        int(".com" in url)
    ]
