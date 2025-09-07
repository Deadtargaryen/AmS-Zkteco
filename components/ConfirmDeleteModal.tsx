import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Input,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  itemId: string;
  itemName: string;
  isLoading?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  itemId,
  itemName,
  isLoading = false,
}) => {
  const [confirmationName, setConfirmationName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setConfirmationName(""); // reset whenever modal opens
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Item</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Type <strong>{itemName}</strong> to confirm deletion.
          </Text>
          <Input
            value={confirmationName}
            onChange={(e) => setConfirmationName(e.target.value)}
            placeholder="Enter full name"
            mt={3}
          />
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={() => onDelete(itemId)}
            isLoading={isLoading}
            isDisabled={confirmationName !== itemName}
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmDeleteModal;
