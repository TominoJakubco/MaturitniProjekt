package org.projekt.config;

import com.github.skjolber.packing.api.Packager;
import com.github.skjolber.packing.api.PackagerResultBuilder;
import com.github.skjolber.packing.packer.plain.PlainPackager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PackingConfig {
    @Bean
    public static PlainPackager createPackager() {
        return PlainPackager.newBuilder().build();
    }
}
