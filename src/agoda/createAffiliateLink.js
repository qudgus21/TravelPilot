export const createAffiliateLink = (hotelId) => {
  return `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=${process.env.AFFILIATE_CID}&hl=ko-kr&hid=${hotelId}`;
};

export const createAffiliateImageTag = (hotelId, imagePath) => {
  const baseSrc = imagePath.replace(/^https?:/, "");
  const src480 = `${baseSrc}?s=480x360`;
  const src960 = `${baseSrc}?s=960x720`;

  const link = createAffiliateLink(hotelId);

  return `
    <a href="${link}" target="_blank">
    <img src="${src480}" 
        srcset="${src480} 1x, ${src960} 2x" 
        alt="호텔 이미지" />
    </a>
  `.trim();
};
