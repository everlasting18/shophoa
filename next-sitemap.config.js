/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://vuonhoatuoi.vn",
  generateRobotsTxt: true,
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/dat-hoa", "/dat-hoa/*", "/gio-hang", "/my-account", "/my-account/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/dat-hoa", "/gio-hang", "/my-account"] },
    ],
    additionalSitemaps: ["https://vuonhoatuoi.vn/sitemap.xml"],
  },
};
