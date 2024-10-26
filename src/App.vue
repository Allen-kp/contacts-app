<template>
  <div id="app" class="container-fluid p-4">
    <div class="row">
      <!-- Form for Data Entry -->
      <div class="col-md-4">
        <b-card title="Data Entry" class="mb-3" border-variant="primary" header-bg-variant="primary" header-text-variant="white">
          <b-form @submit.prevent="isEditing ? updateData() : saveData()">
            <b-form-group label="Name" label-for="name">
              <b-form-input id="name" v-model="formData.name" required placeholder="Enter your name"></b-form-input>
            </b-form-group>

            <b-form-group label="Phone Number" label-for="phone">
              <b-form-input id="phone" v-model="formData.phone" type="tel" required placeholder="Enter phone number"></b-form-input>
            </b-form-group>

            <b-form-group label="Address" label-for="address">
              <b-form-input id="address" v-model="formData.address" required placeholder="Enter address"></b-form-input>
            </b-form-group>

            <b-button type="submit" variant="primary" block>{{ isEditing ? 'Update Data' : 'Save Data' }}</b-button>
          </b-form>

          <!-- Upload CSV/VCF File -->
          <div class="mt-3">
            <label for="fileUpload">Upload Contacts (CSV, VCF, vCard)</label>
            <input type="file" @change="handleFileUpload" accept=".csv, .vcf, .vcard" id="fileUpload" class="form-control-file">
          </div>
          <b-button variant="primary" class="mt-3" @click="processUploadedFile" block>Upload</b-button>
        </b-card>
      </div>

      <!-- Display Saved Data with Filters, Pagination, and Table -->
      <div class="col-md-8">
        <b-card title="Saved Data" class="mb-3" border-variant="info" header-bg-variant="info" header-text-variant="white">
          <!-- Filters -->
          <b-form inline class="mb-2">
            <b-form-group label="Filter by Name: " label-for="filterName">
              <b-form-input id="filterName" v-model="nameFilter" placeholder="Filter by name"></b-form-input>
            </b-form-group>
            <b-form-group label="Filter by Phone: " label-for="filterPhone" class="ml-3">
              <b-form-input id="filterPhone" v-model="phoneFilter" placeholder="Filter by phone number"></b-form-input>
            </b-form-group>
            <b-button variant="danger" class="ml-3" @click="clearFilters">Clear Filters</b-button>
          </b-form>

          <!-- Table with Pagination and Actions -->
          <b-table striped hover :items="paginatedData" :fields="tableFields" responsive="sm">
            <template #cell(actions)="row">
              <b-button size="sm" variant="warning" @click="editData(row.item, row.index)">Edit</b-button>
              <b-button size="sm" variant="danger" @click="deleteData(row.index)">Delete</b-button>
            </template>
          </b-table>
          <b-pagination
            v-model="currentPage"
            :total-rows="filteredData.length"
            :per-page="itemsPerPage"
            aria-controls="savedDataTable"
            class="mt-3"
          ></b-pagination>
        </b-card>

        <b-button variant="success" @click="exportToPDF" block>Export to PDF</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import jsPDF from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";

export default {
  data() {
    return {
      formData: { name: "", phone: "", address: "" },
      savedData: [],
      tableFields: [
        { key: 'index', label: 'Index' },
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone Number' },
        { key: 'address', label: 'Address' },
        { key: 'actions', label: 'Actions' }
      ],
      nameFilter: '',
      phoneFilter: '',
      isEditing: false,
      editingIndex: -1,
      currentPage: 1,
      itemsPerPage: 20,
      uploadedFile: null,
    };
  },
  mounted() {
    this.getData();
  },
  computed: {
    // Filtered and Paginated Data
    filteredData() {
      return this.savedData
        .filter(data =>
          (!this.nameFilter || data.name.toLowerCase().includes(this.nameFilter.toLowerCase())) &&
          (!this.phoneFilter || data.phone.includes(this.phoneFilter))
        )
        .map((data, index) => ({ ...data, index: index + 1 }));
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredData.slice(start, end);
    }
  },
  methods: {
    saveData() {
      let data = JSON.parse(localStorage.getItem("formData")) || [];
      data.push({ name: this.formData.name, phone: this.formData.phone, address: this.formData.address });
      localStorage.setItem("formData", JSON.stringify(data));
      this.getData();
      this.resetForm();
    },
    getData() {
      this.savedData = JSON.parse(localStorage.getItem("formData")) || [];
    },
    resetForm() {
      this.formData = { name: "", phone: "", address: "" };
    },
    deleteData(index) {
      this.savedData.splice(index, 1);
      localStorage.setItem("formData", JSON.stringify(this.savedData));
      this.getData();
    },
    editData(data, index) {
      this.formData = { ...data };
      this.isEditing = true;
      this.editingIndex = index;
    },
    updateData() {
      this.savedData[this.editingIndex] = { ...this.formData };
      localStorage.setItem("formData", JSON.stringify(this.savedData));
      this.resetForm();
      this.isEditing = false;
    },
    clearFilters() {
      this.nameFilter = '';
      this.phoneFilter = '';
    },
    exportToPDF() {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('WASHIRIKA', 105, 20, null, null, 'center');
      const columns = ["Index", "Name", "Phone Number", "Address"];
      const rows = this.filteredData.map(data => [data.index, data.name, data.phone, data.address]);
      doc.autoTable({ startY: 30, head: [columns], body: rows });
      doc.save("data-table.pdf");
    },
    handleFileUpload(event) {
      this.uploadedFile = event.target.files[0];
    },
    processUploadedFile() {
      if (!this.uploadedFile) return;

      const fileType = this.uploadedFile.name.split('.').pop().toLowerCase();

      if (fileType === "csv") {
        this.parseCSVFile(this.uploadedFile);
      } else if (fileType === "vcf" || fileType === "vcard") {
        this.parseVCFFile(this.uploadedFile);
      }
    },
    parseCSVFile(file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const contacts = results.data.map(row => ({
            name: row.name || "",
            phone: row.phone || "",
            address: row.address || "",
          }));
          this.saveContacts(contacts);
        }
      });
    },
    parseVCFFile(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const vcardData = event.target.result.split("END:VCARD").filter(Boolean);
        const contacts = vcardData.map(vcard => {
          const name = vcard.match(/FN:(.*)/)?.[1]?.trim() || "";
          const phone = vcard.match(/TEL.*:(.*)/)?.[1]?.trim() || "";
          const address = vcard.match(/ADR.*:(.*)/)?.[1]?.trim() || "";
          return { name, phone, address };
        });
        this.saveContacts(contacts);
      };
      reader.readAsText(file);
    },
    saveContacts(contacts) {
      this.savedData = [...this.savedData, ...contacts];
      localStorage.setItem("formData", JSON.stringify(this.savedData));
      this.getData();
    }
  }
};
</script>

<style scoped>
.container-fluid { max-width: 1200px; margin: auto; }
b-card { box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
b-button { margin-top: 10px; }
</style>
