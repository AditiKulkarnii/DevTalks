import React, { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigaion, { activeTabRef } from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const Home = () => {
  let [blogs, setBlogs] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [pageState, setPageState] = useState('home')
  let categories = [
    "Programming",
    "Business",
    "Self Improvement",
    "Development",
    "Entrepreneurship",
    "Technology",
    "AI",
    "Design"
  ];
  
  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blog", { page })
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: '/all-latest-blogs-count'
        })
        setBlogs(formattedData);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blog")
      .then(({ data }) => {
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const fetchBlogByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: pageState, page })
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: '/all-search-blogs-count',
          data_to_send: { tag: pageState }
        })
        setBlogs(formattedData);
        // console.log(formattedData);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  

  const loadBlogbyCategory = (e) => {
    let category = e.target.innerText.toLowerCase().trim();
    setBlogs(null);

    if (pageState === category) {
      setPageState('home');
      return;
    }
    setPageState(category);
    console.log("pagestate",pageState);
  };

  useEffect(() => {
    activeTabRef.current.click();
    if (pageState === 'home')
      fetchLatestBlogs({ page: 1 });
    else {
      fetchBlogByCategory({ page: 1 })
    }
    if (!trendingBlogs)
      fetchTrendingBlogs();
  }, [pageState]);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigaion
            routes={[pageState, "trending blog"]}
            defaultHidden={["trending blog"]}
          >
            <>
              {blogs === null ? (
                <Loader />
              ) : (
                !blogs.results.length ? <NoDataMessage message={'No blog published'} /> : 
                blogs.results.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              )}
              <LoadMoreDataBtn state={blogs} fetchDataFun={(pageState === 'home' ? fetchLatestBlogs : fetchBlogByCategory )}/>
            </>
            {trendingBlogs === null ? (
              <Loader />
            ) : (
              trendingBlogs.length ? 
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    key={i}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                )
              })
              : <NoDataMessage message={'No blog Trending'} /> 
            )}
          </InPageNavigaion>
        </div>
        <div className="min-w-[70%] lg:min-w-[400px] max-w-min border-xl border-grey border-shadow-xl pl-8 pt-3 max-md:hidden">
            <div className="flex flex-col gap-10">
                <div>
                    <h1 className="font-medium text-xl mb-8">
                        Stories from all interests
                    </h1>
                    <div className="flex gap-3 flex-wrap font-md">
                        {categories.map((category, i) => {
                        return (
                            <button onClick={loadBlogbyCategory} key={i} className={"tag " + (pageState.toLowerCase() === category.toLowerCase() ? "bg-black text-white text-md" : "")}>
                            {category}
                            </button>
                        );
                        })}
                    </div>
                </div>
                
                <div>
                    <h1 className="text-xl font-medium mb-8">
                        Trending <i className="fi fi-rr-arrow-trend-up"></i>
                    </h1>
                    {trendingBlogs === null ? (
                        <Loader />
                    ) : (
                        trendingBlogs.length ? 
                        trendingBlogs.map((blog, i) => {
                        return (
                            <AnimationWrapper
                            key={i}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            >
                            <MinimalBlogPost blog={blog} index={i} />
                            </AnimationWrapper>
                        );
                        })
                        : <NoDataMessage message={'No blog Trending'} /> 
                    )}
                </div>
            </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default Home;
