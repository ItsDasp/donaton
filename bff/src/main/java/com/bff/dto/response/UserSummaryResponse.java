package com.bff.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserSummaryResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
}
