const cheerio = require("cheerio");
const axios = require("axios");
const searchString = "msila";                        // what we want to search
const encodedString = encodeURI(searchString);          // what we want to search for in URI encoding
const pagesLimit = 5;                            // limit of pages for getting info
const domain = `http://scholar.google.com`;
const allProfiles = [];
const all=[]

const AXIOS_OPTIONS = {
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36 Edg/103.0.1264.62",
    },                                                    // adding the User-Agent header as one way to prevent the request from being blocked
    params: {
        mauthors: encodedString,                            // our encoded search string
        hl: "en",                                           // parameter defines the language to use for the Google search
        view_op: "search_authors",                          // parameter defines what kind of search we want to use
    },
};
function buildValidLink(rawLink) {
    if (!rawLink) return "link not available";
    return domain + rawLink;
}
function getHTML(link, options = AXIOS_OPTIONS.headers) {
    return axios.get(link, options).then(function ({ data }) {
        return cheerio.load(data);
    });
}
function fillProfilesData($) {
    const profiles = Array.from($(".gsc_1usr")).map((el) => {
        const link = buildValidLink($(el).find(".gs_ai_name a").attr("href"));
        const authorIdPattern = /user=(?<id>[^&]+)/gm                       //https://regex101.com/r/oxoQEj/1
        const authorId = link.match(authorIdPattern)[0].replace('user=', '')
        return {
            name: $(el).find(".gs_ai_name a").text().trim(),
            link,
            authorId,
            photo: $(el).find(".gs_ai_pho img").attr("src"),
            affiliations: $(el).find(".gs_ai_aff").text().trim().replace("\n", ""),
            email: $(el).find(".gs_ai_eml").text().trim() || "email not available",
            cited_by: $(el).find(".gs_ai_cby").text().trim(),
            interests: Array.from($(el).find(".gs_ai_one_int")).map((interest) => {
                return {
                    title: $(interest).text().trim(),
                    link: buildValidLink($(interest).attr("href")),
                };
            }),
        };
    });
    const isNextPage = buildValidLink(
        $(".gs_btnPR:not([disabled])")
            ?.attr("onclick")
            ?.replace("window.location='", "")
            .split("'").join("")
            .split("\\x3d").join("=")
            .split("\\x26").join("&")
    );
    return { profiles, isNextPage };
}
function getScholarProfilesInfo(link) {
    if (!link) {
        return getHTML(`${domain}/citations`, AXIOS_OPTIONS).then(fillProfilesData);
    } else {
        return getHTML(link).then(fillProfilesData);
    }
}
async function startScrape() {
    let nextPageLink;
    let currentPage = 1;
    while (true) {
        const data = await getScholarProfilesInfo(nextPageLink);
        allProfiles.push(...data.profiles);
        all.push(data)
        nextPageLink = data.isNextPage;
        currentPage++;
        if (nextPageLink === "link not available" || currentPage > pagesLimit) break;
    }
    return allProfiles;
}

startScrape().then((all)=>{
   all.map((e)=>{
       console.dirxml(e)
   })
})
