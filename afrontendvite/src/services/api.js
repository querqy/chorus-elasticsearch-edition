// CONFIGURATION: Change this field based on the active dataset
// Local Icecat Dataset: "attr_t_product_type.keyword"
// Online Chorus Dataset: "filter_product_type.keyword"
const TYPE_FIELD = "attr_t_product_type.keyword";

export const fetchProducts = async ({
  searchTerm = "",
  page = 1,
  algo = "default",
  types = [],
}) => {
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const fields = [
    "id",
    "name",
    "title",
    "product_type",
    "short_description",
    "ean",
  ];

  let baseQuery = { match_all: {} };

  if (searchTerm) {
    if (algo === "baseline_title_weight") {
      baseQuery = {
        multi_match: {
          query: searchTerm,
          fields: ["title^3", "name^2", "short_description"],
        },
      };
    } else {
      baseQuery = { multi_match: { query: searchTerm, fields: fields } };
    }
  }

  const filterConditions = [];
  if (types.length > 0) {
    filterConditions.push({ terms: { [TYPE_FIELD]: types } });
  }

  const body = {
    from: from,
    size: pageSize,
    query: {
      bool: {
        must: baseQuery,
        filter: filterConditions,
      },
    },
    aggs: {
      product_types: { terms: { field: TYPE_FIELD, size: 20 } },
    },
  };

  try {
    const response = await fetch("http://localhost:9200/ecommerce/_search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("elastic:ElasticRocks"),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("Server error " + response.status);

    const data = await response.json();

    return {
      products:
        data.hits?.hits?.map((h) => ({ id: h._id, ...h._source })) || [],
      totalResults: data.hits?.total?.value || 0,
      typeAggs: data.aggregations?.product_types?.buckets || [],
    };
  } catch (error) {
    console.error("Fetch failed:", error);
    return { products: [], totalResults: 0, typeAggs: [] };
  }
};
