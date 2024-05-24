package dev.kassiopeia.blog.modules.stacks.services;

import org.springframework.stereotype.Service;

import dev.kassiopeia.blog.modules.stacks.DTOs.StackDTO;
import dev.kassiopeia.blog.modules.stacks.entities.Stack;

@Service
public class StackService {
    public StackDTO toDataTransferObject(Stack stack) {
        return new StackDTO(stack.getName(), stack.getDescription());
    }
}
