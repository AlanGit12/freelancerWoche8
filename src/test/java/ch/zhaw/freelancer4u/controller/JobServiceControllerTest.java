package ch.zhaw.freelancer4u.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.mockito.Mockito;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import ch.zhaw.freelancer4u.model.Company;
import ch.zhaw.freelancer4u.model.Job;
import ch.zhaw.freelancer4u.model.JobState;
import ch.zhaw.freelancer4u.model.JobStateChangeDTO;
import ch.zhaw.freelancer4u.model.JobType;
import ch.zhaw.freelancer4u.repository.CompanyRepository;
import ch.zhaw.freelancer4u.repository.JobRepository;
import ch.zhaw.freelancer4u.security.TestSecurityConfig;
import ch.zhaw.freelancer4u.service.JobService;
import ch.zhaw.freelancer4u.service.UserService;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestSecurityConfig.class)
@TestMethodOrder(OrderAnnotation.class)
public class JobServiceControllerTest {
    @Autowired
    private MockMvc mvc;

    @Autowired
    CompanyRepository companyRepository;

    @Autowired
    JobRepository jobRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String companyId;
    private String jobId;

    @MockitoBean
    UserService userService;

      @Autowired
    JobService jobService;

    @Test
    public void testCompleteMyJob() throws Exception {
        jobService.assignJob(jobId, "freelancer@test.com");
        when(userService.getEmail()).thenReturn("freelancer@test.com");
        mvc.perform(put("/api/service/me/completejob")
                .param("jobId", jobId)
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, TestSecurityConfig.USER))
                .andDo(print())
                .andExpect(status().isOk());
        assertEquals(JobState.DONE, jobRepository.findById(jobId).get().getJobState());
    }    


    @BeforeEach
    public void setup() {
        var company = new Company("test", "test@test.com");
        company = companyRepository.insert(company);
        companyId = company.getId();
        var job = new Job("title", "desc", JobType.IMPLEMENT, 3d, company.getId());
        job = jobRepository.insert(job);
        jobId = job.getId();

        when(userService.userHasRole(Mockito.anyString())).thenCallRealMethod();
    }

    @Test
    void testAssignJob() throws Exception {
        var changeDTO = mock(JobStateChangeDTO.class);
        when(changeDTO.getFreelancerId()).thenReturn("freelancer@test.com");
        when(changeDTO.getJobId()).thenReturn(jobId);
        String jsonBody = objectMapper.writeValueAsString(changeDTO);
        mvc.perform(put("/api/service/assignjob")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, TestSecurityConfig.ADMIN)
                .content(jsonBody))
                .andDo(print())
                .andExpect(status().isOk());
        assertEquals("freelancer@test.com", jobRepository.findById(jobId).get().getFreelancerId());
    }
}