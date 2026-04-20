import axios from "axios";
import { API_BASE_URL } from "$env/static/private";
import { fail, error } from "@sveltejs/kit";

export async function load({ url, locals }) {
  const jwt_token = locals.jwt_token;
  const user = locals.user;

  if (!jwt_token) {
    return {
      jobs: [],
      companies: [],
      nrOfPages: 0,
      currentPage: 1,
      user: null,
      isAuthenticated: false
    };
  }

  try {
    const currentPage = parseInt(url.searchParams.get("pageNumber") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "4");

    const query = `?pageSize=${pageSize}&pageNumber=${currentPage}`;

    const jobsResponse = await axios({
      method: "get",
      url: `${API_BASE_URL}/api/job${query}`,
      headers: { Authorization: "Bearer " + jwt_token }
    });

    let companiesResponse = { data: [] };

    if (user?.user_roles?.includes("admin")) {
      companiesResponse = await axios({
        method: "get",
        url: `${API_BASE_URL}/api/company`,
        headers: { Authorization: "Bearer " + jwt_token }
      });
    }

    return {
      jobs: jobsResponse.data.content || [],
      companies: companiesResponse.data || [],
      nrOfPages: jobsResponse.data.totalPages || 0,
      currentPage,
      user,
      isAuthenticated: true
    };
  } catch (e) {
    console.log("Error loading jobs page:", e);
    return {
      jobs: [],
      companies: [],
      nrOfPages: 0,
      currentPage: 1,
      user,
      isAuthenticated: true
    };
  }
}

export const actions = {
  createJob: async ({ request, locals }) => {
    const jwt_token = locals.jwt_token;

    if (!jwt_token) {
      throw error(401, "Authentication required");
    }

    const data = await request.formData();

    const title = data.get("title");
    const description = data.get("description");
    const jobType = data.get("jobType");
    const earnings = parseFloat(data.get("earnings"));
    const companyId = data.get("companyId");

    try {
      await axios({
        method: "post",
        url: `${API_BASE_URL}/api/job`,
        data: {
          title,
          description,
          jobType,
          earnings,
          companyId
        },
        headers: { Authorization: "Bearer " + jwt_token }
      });

      return { success: true };
    } catch (err) {
      console.log("Error creating job:", err);
      return fail(400, { error: "Could not create job." });
    }
  },

  assignToMe: async ({ request, locals }) => {
    const jwt_token = locals.jwt_token;

    if (!jwt_token) {
      throw error(401, "Authentication required");
    }

    const data = await request.formData();
    const jobId = data.get("jobId");

    try {
      await axios({
        method: "put",
        url: `${API_BASE_URL}/api/service/me/assignjob?jobId=${jobId}`,
        headers: { Authorization: "Bearer " + jwt_token }
      });

      return { success: true };
    } catch (err) {
      console.log("Error assigning job:", err);
      return fail(400, { error: "Could not assign job." });
    }
  },

  completeMyJob: async ({ request, locals }) => {
    const jwt_token = locals.jwt_token;

    if (!jwt_token) {
      throw error(401, "Authentication required");
    }

    const data = await request.formData();
    const jobId = data.get("jobId");

    try {
      await axios({
        method: "put",
        url: `${API_BASE_URL}/api/service/me/completejob?jobId=${jobId}`,
        headers: { Authorization: "Bearer " + jwt_token }
      });

      return { success: true };
    } catch (err) {
      console.log("Error completing job:", err);
      return fail(400, { error: "Could not complete job." });
    }
  }
};