<template>
  <div id="app" class="container mt-5">
    <h1 class="text-center mb-4">Contact Manager</h1>

    <!-- Contact Form -->
    <form @submit.prevent="saveData" class="mb-4">
      <div class="row">
        <div class="col">
          <input
            type="text"
            v-model="formData.name"
            class="form-control"
            placeholder="Name"
            required
          />
        </div>
        <div class="col">
          <input
            type="tel"
            v-model="formData.phone"
            class="form-control"
            placeholder="Phone"
            required
          />
        </div>
        <div class="col">
          <input
            type="text"
            v-model="formData.address"
            class="form-control"
            placeholder="Address"
            required
          />
        </div>
        <div class="col-auto">
          <button type="submit" class="btn btn-primary">
            {{ isEdit ? 'Update' : 'Save' }}
          </button>
          <button @click="exportToPDF" type="button" class="btn btn-secondary ms-2">
            Export to PDF
          </button>
        </div>
      </div>
    </form>

    <!-- Contacts Table -->
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Index</th>
          <th>Name</th>
          <th>Phone</th>
          <th>Address</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(contact, index) in savedData" :key="contact.id">
          <td>{{ index + 1 }}</td>
          <td>{{ contact.name }}</td>
          <td>{{ contact.phone }}</td>
          <td>{{ contact.address }}</td>
          <td>
            <button @click="deleteData(contact.id)" class="btn btn-danger btn-sm">Delete</button>
            <button @click="editData(contact)" class="btn btn-warning btn-sm ms-1">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
  name: 'App',
  setup() {
    const db = inject('db');
    const formData = ref({ name: '', phone: '', address: '' });
    const savedData = ref([]);
    const isEdit = ref(false);
    const editId = ref(null);

    // Save data to Firestore
    const saveData = async () => {
      if (isEdit.value) {
        await updateDoc(doc(db, 'contacts', editId.value), formData.value);
        isEdit.value = false;
        editId.value = null;
      } else {
        await addDoc(collection(db, 'contacts'), formData.value);
      }
      formData.value = { name: '', phone: '', address: '' };
      getData();
    };

    // Fetch all contacts from Firestore
    const getData = async () => {
      const querySnapshot = await getDocs(collection(db, 'contacts'));
      savedData.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    };

    // Delete contact from Firestore
    const deleteData = async (id) => {
      await deleteDoc(doc(db, 'contacts', id));
      getData();
    };

    // Set up edit mode for a contact
    const editData = (contact) => {
      formData.value = { ...contact };
      isEdit.value = true;
      editId.value = contact.id;
    };

    // Export saved contacts to PDF
    const exportToPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('WASHIRIKA', 14, 22); // Title

      const tableColumn = ["Index", "Name", "Phone", "Address"];
      const tableRows = [];

      savedData.value.forEach((contact, index) => {
        const contactData = [
          index + 1, // Index
          contact.name,
          contact.phone,
          contact.address
        ];
        tableRows.push(contactData);
      });

      doc.autoTable(tableColumn, tableRows, { startY: 30 });
      doc.save('contacts.pdf');
    };

    // Fetch data on component mount
    onMounted(() => {
      getData();
    });

    return {
      formData,
      savedData,
      saveData,
      deleteData,
      editData,
      exportToPDF,
      isEdit,
    };
  },
};
</script>

<style scoped>
#app {
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
}

.table th {
  background-color: #007bff;
  color: white;
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: #f9f9f9;
}
</style>
