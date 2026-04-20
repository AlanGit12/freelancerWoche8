export async function load({ url, locals }) {

    const jwt_token = locals.jwt_token;
    const user = locals.user;

    if (!jwt_token) {
        return {
            jobs: [],
            companies: []
        };
    }

    try {
        const currentPage = parseInt(url.searchParams.get('pageNumber') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '4');

        const query = `?pageSize=${pageSize}&pageNumber=${currentPage}`;

        const jobsResponse = await axios({
            method: "get",
            url: `${API_BASE_URL}/api/job` + query,
            headers: { Authorization: "Bearer " + jwt_token },
        });

        return {
            jobs: jobsResponse.data.content,
            nrOfPages: jobsResponse.data.totalPages,
            currentPage: currentPage,
            user: user
        };

    } catch (e) {
        console.log(e);
    }
}