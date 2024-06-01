package dev.kassiopeia.blog.modules.stack.services;

import org.springframework.stereotype.Service;

import dev.kassiopeia.blog.modules.stack.DTOs.InternalStackDTO;
import dev.kassiopeia.blog.modules.stack.DTOs.StackDTO;
import dev.kassiopeia.blog.modules.stack.entities.Stack;

@Service
public class StackService {
    public StackDTO toDataTransferObject(Stack stack) {
        return new StackDTO(stack.getName(), stack.getDescription());
    }

    public InternalStackDTO toInternal(Stack stack) {
        return new InternalStackDTO(stack.getName(), stack.getDescription());
    }
}
